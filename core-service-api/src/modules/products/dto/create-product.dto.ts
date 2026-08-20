import {
  IsString,
  IsOptional,
  IsNumber,
  IsPositive,
  IsBoolean,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  units_per_sale_unit?: number;

  @IsNumber()
  @IsPositive()
  unit_price: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
