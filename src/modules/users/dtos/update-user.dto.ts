import { UserRole } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateUserRoleDto {
  @IsEnum(UserRole, { message: 'Invalid role provided. Must be admin, editor, or viewer.' })
  @IsNotEmpty({ message: 'Role cannot be empty.' })
  role: UserRole;
}