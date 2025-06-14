import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { UserRole } from 'src/common/constants/roles.enum';



export class CreateUserDto {
  @IsString({ message: 'First name must be a string.' })
  @IsNotEmpty({ message: 'First name cannot be empty.' })
  @MaxLength(50, { message: 'First name cannot be longer than 50 characters.' })
  firstName: string;

  @IsString({ message: 'Last name must be a string.' })
  @IsNotEmpty({ message: 'Last name cannot be empty.' })
  @MaxLength(50, { message: 'Last name cannot be longer than 50 characters.' })
  lastName: string;
  
  @IsEmail({}, { message: 'Invalid email format.' })
  @IsNotEmpty({ message: 'Email cannot be empty.' })
  email: string;

  @IsString({ message: 'Password hash must be a string.' })
  @IsNotEmpty({ message: 'Password hash cannot be empty.' })
  passwordHash: string;

  @IsEnum(UserRole, { message: 'Invalid user role.' })
  @IsOptional()
  role?: UserRole;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
