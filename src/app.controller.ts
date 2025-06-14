import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator'; // Custom decorator for public routes

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public() // Mark this endpoint as public, bypassing authentication
  @Get('health')
  getHealth(): string {
    return this.appService.getHealth();
  }
}