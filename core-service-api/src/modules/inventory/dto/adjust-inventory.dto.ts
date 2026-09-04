import { IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class AdjustInventoryDto {
  @IsNumber()
  @Min(0)
  availableQuantity: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
