import {
  IsString,
  IsOptional,
  IsNumber,
  IsPositive,
  IsBoolean,
} from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  unit_price?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
