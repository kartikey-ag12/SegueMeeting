import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateOrganisationDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}
