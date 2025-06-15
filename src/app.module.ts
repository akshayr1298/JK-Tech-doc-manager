import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './config/database/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { AppConfigModule } from './config/config.module';

@Module({
  imports: [
     ConfigModule.forRoot({ isGlobal: true }),
     PrismaModule,
     AuthModule,
     UsersModule,
     DocumentsModule,
     AppConfigModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
