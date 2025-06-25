import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dtos/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dtos/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<any> {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      this.logger.warn(
        `Registration failed: User with email ${registerDto.email} already exists.`,
      );
      throw new BadRequestException('User with this email already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(registerDto.password, salt); // Hash password
    const user = await this.usersService.create({
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      email: registerDto.email,
      passwordHash: hashedPassword,
      role: registerDto.role,
    });
    this.logger.log(
      `User registered successfully: ${user.email} (ID: ${user.id})`,
    );

    const { ...result } = user;
    return result as any;
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      this.logger.warn(`Login failed: User ${loginDto.email} not found.`);
      throw new UnauthorizedException('Invalid credentials.');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      this.logger.warn(
        `Login failed: Invalid password for user ${loginDto.email}.`,
      );
      throw new UnauthorizedException('Invalid credentials.');
    }

    if (!user.isActive) {
      this.logger.warn(
        `Login failed: Inactive account for user ${loginDto.email}.`,
      );
      throw new UnauthorizedException(
        'Account is inactive. Please contact support.',
      );
    }

    // Generate JWT token
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  // Used by JwtStrategy to validate user based on JWT payload
  async validateUser(payload: any): Promise<any> {
    this.logger.debug(`Validating user from JWT payload: ${payload.email}`);
    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.isActive) {
      this.logger.warn(
        `User validation failed: User ${payload.email} not found or inactive.`,
      );
      throw new UnauthorizedException('User is inactive or not found.');
    }
    this.logger.debug(`User validated successfully: ${user.email}`);
    return user;
  }
}
