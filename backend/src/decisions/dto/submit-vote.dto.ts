import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class SubmitVoteDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['IN_FAVOUR', 'AGAINST', 'ABSTAIN'])
  vote: string;

  @IsOptional()
  @IsString()
  comment?: string;
}
