import { Type } from 'class-transformer';
import {
  IsOptional,
  IsDateString,
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
  IsPositive,
  IsUUID,
} from 'class-validator';

export class UpdateOrderItemDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsNumber()
  @IsPositive()
  unitPrice: number;
}

export class UpdateOrderDto {
  @IsOptional()
  @IsDateString()
  deliveryDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderItemDto)
  items?: UpdateOrderItemDto[];
}
