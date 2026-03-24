import { IsString } from 'class-validator';

export class UpdateProductionStatusDto {
  @IsString()
  status: string;
}
