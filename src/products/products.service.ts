import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import type {
  Product,
  ProductListItem,
  BatchPayload,
} from './entities/product.entity.js';
import { ImportRowDto } from './dto/import-products.dto.js';

export interface ImportSummary {
  imported: number;
  updated: number;
  skipped: number;
}

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Import ────────────────────────────────────────────────────────────────
  async importProducts(rows: ImportRowDto[]): Promise<ImportSummary> {
    // One query to fetch all potentially matching products
    const codes = rows.map((r) => r.code);
    const existing = await this.prisma.product.findMany({
      where: { code: { in: codes } },
      select: { id: true, code: true, name: true, price: true },
    });

    const byCode = new Map(existing.map((p) => [p.code, p]));

    const toCreate: ImportRowDto[] = [];
    const toUpdate: Array<{ id: number; name?: string; price?: number }> = [];
    let skipped = 0;

    for (const row of rows) {
      const found = byCode.get(row.code);

      if (!found) {
        toCreate.push(row);
        continue;
      }

      const sameName = found.name === row.name;
      const samePrice = Number(found.price) === row.price;

      if (sameName && samePrice) {
        skipped++;
        continue;
      }

      toUpdate.push({
        id: found.id,
        ...(!sameName && { name: row.name }),
        ...(!samePrice && { price: row.price }),
      });
    }

    await this.prisma.$transaction([
      ...toCreate.map((r) => this.prisma.product.create({ data: r })),
      ...toUpdate.map(({ id, ...data }) =>
        this.prisma.product.update({ where: { id }, data }),
      ),
    ]);

    return { imported: toCreate.length, updated: toUpdate.length, skipped };
  }

  // ─── CRUD ──────────────────────────────────────────────────────────────────

  async create(dto: CreateProductDto): Promise<Product> {
    return (await this.prisma.product.create({ data: dto })) as Product;
  }

  async findAll(
    limit: number,
    offset: number,
    activeOnly: boolean,
  ): Promise<{ data: ProductListItem[]; total: number }> {
    const where = activeOnly ? { state: true } : {};
    const [data, total]: [ProductListItem[], number] = await Promise.all([
      this.prisma.product.findMany({
        where,
        take: limit,
        skip: offset,
        select: { id: true, code: true, name: true, price: true, state: true },
      }) as Promise<ProductListItem[]>,
      this.prisma.product.count({ where }) as Promise<number>,
    ]);
    return { data, total };
  }

  async findOne(id: number): Promise<Product> {
    const product = (await this.prisma.product.findUnique({
      where: { id },
    })) as Product | null;
    if (!product) throw new NotFoundException(`Product #${id} not found`);
    return product;
  }

  async findByCode(code: number): Promise<ProductListItem | null> {
    return (await this.prisma.product.findFirst({
      where: { code },
      select: { id: true, code: true, name: true, price: true },
    })) as ProductListItem | null;
  }

  async findByName(name: string): Promise<ProductListItem | null> {
    return (await this.prisma.product.findFirst({
      where: { name, state: true },
      select: { id: true, code: true, name: true, price: true },
    })) as ProductListItem | null;
  }

  async findByLike(name: string): Promise<ProductListItem[]> {
    if (!name.trim()) return [];
    return (await this.prisma.product.findMany({
      where: { name: { startsWith: name, mode: 'insensitive' }, state: true },
      select: { id: true, code: true, name: true, price: true },
    })) as ProductListItem[];
  }

  async exportAll(): Promise<ProductListItem[]> {
    return (await this.prisma.product.findMany({
      where: { state: true },
      select: { id: true, code: true, name: true, price: true },
    })) as ProductListItem[];
  }

  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    await this.findOne(id);
    return (await this.prisma.product.update({
      where: { id },
      data: dto,
    })) as Product;
  }

  async softDelete(id: number): Promise<Product> {
    await this.findOne(id);
    return (await this.prisma.product.update({
      where: { id },
      data: { state: false },
    })) as Product;
  }

  async reactivate(id: number): Promise<Product> {
    await this.findOne(id);
    return (await this.prisma.product.update({
      where: { id },
      data: { state: true },
    })) as Product;
  }

  async remove(id: number): Promise<Product> {
    await this.findOne(id);
    return (await this.prisma.product.delete({
      where: { id },
    })) as Product;
  }

  async softDeleteBatch(ids: number[]): Promise<BatchPayload> {
    if (!ids.length) return { count: 0 };
    return (await this.prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { state: false },
    })) as BatchPayload;
  }

  async reactivateBatch(ids: number[]): Promise<BatchPayload> {
    if (!ids.length) return { count: 0 };
    return (await this.prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { state: true },
    })) as BatchPayload;
  }

  async removeBatch(ids: number[]): Promise<BatchPayload> {
    if (!ids.length) return { count: 0 };
    return (await this.prisma.product.deleteMany({
      where: { id: { in: ids } },
    })) as BatchPayload;
  }
}
