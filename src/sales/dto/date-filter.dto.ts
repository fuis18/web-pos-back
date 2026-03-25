import { IsOptional, IsString } from 'class-validator';

export class DateFilterDto {
  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @IsString()
  timeFrom?: string;

  @IsOptional()
  @IsString()
  timeTo?: string;
}
