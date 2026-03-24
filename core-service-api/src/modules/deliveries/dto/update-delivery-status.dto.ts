import { IsString } from 'class-validator';

export class UpdateDeliveryStatusDto {
  @IsString()
  status: string;
}
