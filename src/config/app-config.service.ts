import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get port(): number {
    return this.configService.get<number>('PORT') ?? 4000;
  }

  get databaseURL(): string {
    return this.configService.get<string>('DATABASE_URL') ?? '';
  }

  get jwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET') ?? '';
  }

  get jwtExpiresIn(): string {
    return this.configService.get<string>('JWT_EXPIRES_IN') ?? '1hr';
  }

  get origin(): string {
    return this.configService.get<string>('ORIGIN') ?? '*';
  }
}
