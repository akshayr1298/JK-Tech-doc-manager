import { UserRole } from 'src/common/constants/roles.enum';
import { LoginDto } from './login.dto';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsEnum,
  IsOptional,
} from 'class-validator';

export class RegisterDto extends LoginDto {
  @IsString({ message: 'First name must be a string.' })
  @IsNotEmpty({ message: 'First name cannot be empty.' })
  @MaxLength(50, { message: 'First name cannot be longer than 50 characters.' })
  firstName: string;

  @IsString({ message: 'Last name must be a string.' })
  @IsNotEmpty({ message: 'Last name cannot be empty.' })
  @MaxLength(50, { message: 'Last name cannot be longer than 50 characters.' })
  lastName: string;

  @IsEnum(UserRole, { message: 'Invalid role provided.' })
  @IsOptional() // Role can be optional during registration, backend might assign default 'viewer'
  role?: UserRole;
}
