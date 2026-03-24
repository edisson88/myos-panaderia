import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsUUID,
} from 'class-validator';

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

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
