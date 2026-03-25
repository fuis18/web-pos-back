import { IsNotEmpty, IsString } from 'class-validator';

export class ReportSaleDto {
  @IsString()
  @IsNotEmpty()
  reason: string;
}
