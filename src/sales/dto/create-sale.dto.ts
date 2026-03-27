import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNumber,
  Min,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';

export class CreateSaleItemDto {
  @IsInt()
  @Min(1)
  productId: number;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;
}

export class CreateSaleDto {
  @IsNumber()
  @Min(0)
  total: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];
}
