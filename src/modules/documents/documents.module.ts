import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: join(__dirname, '..', '..', 'uploads'), // Save uploads to a 'uploads' directory at project root
        filename: (req, file, cb) => {
          // Generate a unique filename to prevent collisions
          const filename = `${uuidv4()}-${file.originalname}`;
          cb(null, filename);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, 
      },
      fileFilter: (req, file, cb) => {
        // Optional: Filter file types
        if (!file.mimetype.match(/\/(pdf|doc|docx|txt|jpg|jpeg|png)$/)) {
          return cb(new Error('Only PDF, DOC, DOCX, TXT, JPG, JPEG, PNG files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
