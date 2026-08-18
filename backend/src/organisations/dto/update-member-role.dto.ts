import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrganisationRole } from '@prisma/client';

export class UpdateMemberRoleDto {
  @IsNotEmpty()
  @IsEnum(OrganisationRole)
  role: OrganisationRole;
}
