import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsPositive,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class ConfirmProductionItemDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  @IsPositive()
  traysProduced: number;
}

export class ConfirmProductionDto {
  @IsDateString()
  dateFrom: string;

  @IsDateString()
  dateTo: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConfirmProductionItemDto)
  items: ConfirmProductionItemDto[];
}
