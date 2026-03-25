import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { SalesService } from './sales.service.js';
import { CreateSaleDto } from './dto/create-sale.dto.js';
import { DateFilterDto } from './dto/date-filter.dto.js';
import { ReportSaleDto } from './dto/report-sale.dto.js';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  create(@Body() dto: CreateSaleDto) {
    return this.salesService.create(dto);
  }

  @Get()
  findAll(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query() dateFilter: DateFilterDto,
  ) {
    return this.salesService.findAll(limit, offset, dateFilter);
  }

  @Get('total')
  getTotal(@Query() dateFilter: DateFilterDto) {
    return this.salesService.getTotal(dateFilter);
  }

  @Get('export')
  exportAll(@Query() dateFilter: DateFilterDto) {
    return this.salesService.exportAll(dateFilter);
  }

  @Get('export/items')
  exportAllItems(@Query() dateFilter: DateFilterDto) {
    return this.salesService.exportAllItems(dateFilter);
  }

  @Get('reported')
  getReportedSaleIds() {
    return this.salesService.getReportedSaleIds();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.salesService.findOne(id);
  }

  @Get(':id/items')
  getItems(@Param('id', ParseIntPipe) id: number) {
    return this.salesService.getItems(id);
  }

  @Get(':id/report')
  getSaleReport(@Param('id', ParseIntPipe) id: number) {
    return this.salesService.getSaleReport(id);
  }

  @Post(':id/report')
  reportSale(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReportSaleDto,
  ) {
    return this.salesService.reportSale(id, dto.reason);
  }

  @Delete(':id/report')
  cancelSaleReport(@Param('id', ParseIntPipe) id: number) {
    return this.salesService.cancelSaleReport(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.salesService.remove(id);
  }
}
