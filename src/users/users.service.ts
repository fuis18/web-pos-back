import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import type { User } from './entities/user.entity.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto): Promise<User> {
    const exists = (await this.prisma.user.findUnique({
      where: { username: dto.username },
    })) as User | null;
    if (exists) throw new ConflictException('Username already exists');
    return (await this.prisma.user.create({
      data: dto,
      select: { id: true, username: true },
    })) as User;
  }

  async findAll(): Promise<User[]> {
    return (await this.prisma.user.findMany({
      select: { id: true, username: true },
    })) as User[];
  }

  async findOne(id: string): Promise<User> {
    const user = (await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true },
    })) as User | null;
    if (!user) throw new NotFoundException(`User #${id} not found`);
    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    return (await this.prisma.user.findUnique({
      where: { username },
      select: { id: true, username: true },
    })) as User | null;
  }

  async login(username: string, password: string): Promise<User | null> {
    const user = (await this.prisma.user.findUnique({
      where: { username },
    })) as { id: string; username: string; password: string } | null;
    if (!user || user.password !== password) return null;
    return { id: user.id, username: user.username };
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    await this.findOne(id);
    return (await this.prisma.user.update({
      where: { id },
      data: dto,
      select: { id: true, username: true },
    })) as User;
  }

  async remove(id: string): Promise<User> {
    await this.findOne(id);
    return (await this.prisma.user.delete({
      where: { id },
    })) as User;
  }
}
