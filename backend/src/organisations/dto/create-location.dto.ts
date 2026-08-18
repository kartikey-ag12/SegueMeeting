import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateLocationDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsString()
  timeZone: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
