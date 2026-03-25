import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateSaleDto } from './dto/create-sale.dto.js';
import { DateFilterDto } from './dto/date-filter.dto.js';
import type {
  Sale,
  SaleListItem,
  SaleItem,
  SaleWithItems,
  SaleReport,
} from './entities/sale.entity.js';

interface DateWhereInput {
  date?: { gte: Date; lte: Date };
}

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  private buildDateWhere(date?: DateFilterDto): DateWhereInput {
    if (!date) return {};
    if (date.from && date.to) {
      return {
        date: {
          gte: new Date(`${date.from}T${date.timeFrom ?? '00:00:00'}`),
          lte: new Date(`${date.to}T${date.timeTo ?? '23:59:59'}`),
        },
      };
    }
    if (date.timeFrom && date.timeTo) {
      const today = new Date().toISOString().split('T')[0];
      return {
        date: {
          gte: new Date(`${today}T${date.timeFrom}`),
          lte: new Date(`${today}T${date.timeTo}`),
        },
      };
    }
    return {};
  }

  async findAll(
    limit: number,
    offset: number,
    date?: DateFilterDto,
  ): Promise<{ data: SaleListItem[]; total: number }> {
    const where = this.buildDateWhere(date);
    const [data, total]: [SaleListItem[], number] = await Promise.all([
      this.prisma.sale.findMany({
        where,
        orderBy: { date: 'desc' },
        take: limit,
        skip: offset,
        select: { id: true, date: true, total: true },
      }) as Promise<SaleListItem[]>,
      this.prisma.sale.count({ where }) as Promise<number>,
    ]);
    return { data, total };
  }

  async findOne(id: number): Promise<Sale> {
    const sale = (await this.prisma.sale.findUnique({
      where: { id },
    })) as Sale | null;
    if (!sale) throw new NotFoundException(`Sale #${id} not found`);
    return sale;
  }

  async getItems(saleId: number): Promise<SaleItem[]> {
    await this.findOne(saleId);
    return (await this.prisma.saleItem.findMany({
      where: { saleId },
      include: {
        product: { select: { name: true, code: true } },
      },
    })) as SaleItem[];
  }

  async getTotal(date?: DateFilterDto): Promise<number> {
    const dateWhere = this.buildDateWhere(date);
    const result = (await this.prisma.sale.aggregate({
      _sum: { total: true },
      where: {
        ...dateWhere,
        saleReport: { is: null },
      },
    })) as { _sum: { total: number | null } };
    return result._sum.total ?? 0;
  }

  async create(dto: CreateSaleDto): Promise<SaleWithItems> {
    return (await this.prisma.sale.create({
      data: {
        total: dto.total,
        saleItems: {
          create: dto.items.map((item) => ({
            productId: item.product_id,
            quantity: item.quantity,
            priceAtSale: item.price,
          })),
        },
      },
      include: { saleItems: true },
    })) as SaleWithItems;
  }

  async exportAll(date?: DateFilterDto): Promise<SaleListItem[]> {
    const where = this.buildDateWhere(date);
    return (await this.prisma.sale.findMany({
      where,
      orderBy: { date: 'desc' },
      select: { id: true, date: true, total: true },
    })) as SaleListItem[];
  }

  async exportAllItems(date?: DateFilterDto): Promise<SaleItem[]> {
    const saleWhere = this.buildDateWhere(date);
    return (await this.prisma.saleItem.findMany({
      where: Object.keys(saleWhere).length ? { sale: saleWhere } : {},
      orderBy: { saleId: 'asc' },
      include: {
        product: { select: { name: true, code: true } },
      },
    })) as SaleItem[];
  }

  async reportSale(saleId: number, reason: string): Promise<SaleReport> {
    await this.findOne(saleId);
    return (await this.prisma.saleReport.create({
      data: { saleId, reason },
    })) as SaleReport;
  }

  async getReportedSaleIds(): Promise<number[]> {
    const rows = (await this.prisma.saleReport.findMany({
      select: { saleId: true },
    })) as { saleId: number }[];
    return rows.map((r) => r.saleId);
  }

  async getSaleReport(saleId: number): Promise<SaleReport | null> {
    return (await this.prisma.saleReport.findUnique({
      where: { saleId },
    })) as SaleReport | null;
  }

  async cancelSaleReport(saleId: number): Promise<SaleReport> {
    return (await this.prisma.saleReport.delete({
      where: { saleId },
    })) as SaleReport;
  }

  async remove(saleId: number): Promise<void> {
    await this.findOne(saleId);
    await this.prisma.$transaction([
      this.prisma.saleReport.deleteMany({ where: { saleId } }),
      this.prisma.saleItem.deleteMany({ where: { saleId } }),
      this.prisma.sale.delete({ where: { id: saleId } }),
    ]);
  }
}
