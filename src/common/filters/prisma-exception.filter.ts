// src/common/filters/prisma-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client.js';
import { FastifyReply } from 'fastify';

@Catch(
  Prisma.PrismaClientKnownRequestError,
  Prisma.PrismaClientUnknownRequestError,
  Prisma.PrismaClientInitializationError,
)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();

    // Error de conexión / DB caída
    if (exception instanceof Prisma.PrismaClientInitializationError) {
      this.logger.error('Database connection failed', exception.message);
      return reply.status(HttpStatus.SERVICE_UNAVAILABLE).send({
        statusCode: 503,
        message: 'Database temporarily unavailable',
      });
    }

    // Errores conocidos (unique constraint, not found, etc.)
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P1001') {
        this.logger.error('Database unreachable (P1001)', exception.meta);
        return reply.status(HttpStatus.SERVICE_UNAVAILABLE).send({
          statusCode: 503,
          message: 'Database temporarily unavailable',
        });
      }
      if (exception.code === 'P2002') {
        return reply.status(HttpStatus.CONFLICT).send({
          statusCode: 409,
          message: 'A record with that value already exists',
        });
      }
      if (exception.code === 'P2025') {
        return reply.status(HttpStatus.NOT_FOUND).send({
          statusCode: 404,
          message: 'Record not found',
        });
      }
    }

    this.logger.error('Unexpected Prisma error', exception);
    return reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
      statusCode: 500,
      message: 'An unexpected database error occurred',
    });
  }
}
