import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsUUID,
} from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  dni?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsUUID()
  user_id?: string;
}
