import { DocumentStatus } from '@prisma/client';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export class UpdateDocumentDto {
  @IsString({ message: 'Title must be a string.' })
  @IsOptional()
  title?: string;

  @IsString({ message: 'Description must be a string.' })
  @IsOptional()
  description?: string;

  @IsEnum(DocumentStatus, { message: 'Invalid document status.' })
  @IsOptional()
  status?: DocumentStatus;
}