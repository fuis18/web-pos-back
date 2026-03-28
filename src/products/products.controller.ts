import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  ParseBoolPipe,
  ParseArrayPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { ImportProductsDto } from './dto/import-products.dto.js';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Post('import')
  importProducts(@Body() dto: ImportProductsDto) {
    return this.productsService.importProducts(dto.rows);
  }

  @Get()
  findAll(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('activeOnly', new DefaultValuePipe(true), ParseBoolPipe)
    activeOnly: boolean,
  ) {
    return this.productsService.findAll(limit, offset, activeOnly);
  }

  @Get('export')
  exportAll() {
    return this.productsService.exportAll();
  }

  @Get('search/code/:code')
  findByCode(@Param('code', ParseIntPipe) code: number) {
    return this.productsService.findByCode(code);
  }

  @Get('search/name')
  findByName(@Query('q') name: string) {
    return this.productsService.findByName(name);
  }

  @Get('search/like')
  findByLike(@Query('q') name: string) {
    return this.productsService.findByLike(name);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Patch(':id/soft-delete')
  softDelete(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.softDelete(id);
  }

  @Patch(':id/reactivate')
  reactivate(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.reactivate(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }

  @Patch('batch/soft-delete')
  softDeleteBatch(
    @Body('ids', new ParseArrayPipe({ items: Number })) ids: number[],
  ) {
    return this.productsService.softDeleteBatch(ids);
  }

  @Patch('batch/reactivate')
  reactivateBatch(
    @Body('ids', new ParseArrayPipe({ items: Number })) ids: number[],
  ) {
    return this.productsService.reactivateBatch(ids);
  }

  @Delete('batch')
  removeBatch(
    @Body('ids', new ParseArrayPipe({ items: Number })) ids: number[],
  ) {
    return this.productsService.removeBatch(ids);
  }
}
