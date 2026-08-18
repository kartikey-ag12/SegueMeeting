import { IsString, IsNotEmpty, IsOptional, IsArray, IsDateString } from 'class-validator';

export class CreateFlyingMinuteDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsDateString()
  closeDate?: string;

  @IsArray()
  @IsString({ each: true })
  voterIds: string[];
}
