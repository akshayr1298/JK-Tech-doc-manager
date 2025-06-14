import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User } from 'src/common/decorators/user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public() // This endpoint does not require authentication
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public() // This endpoint does not require authentication
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // Example of a protected route to get user profile
  @UseGuards(JwtAuthGuard) // Protect this route with JWT authentication
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  getProfile(@User() user) {
    const { passwordHash, ...result } = user;
    return result;
  }

  // Logout typically happens client-side by discarding the token.
  // A backend logout might involve blacklisting tokens, but for stateless JWT, it's often not needed.
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req) {
    // If using JWT blacklist, you'd add the current token to a blacklist here.
    // For this example, we'll just acknowledge the logout.
    return {
      message:
        'Logged out successfully (token should be discarded client-side).',
    };
  }
}
