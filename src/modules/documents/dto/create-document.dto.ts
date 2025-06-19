import { DocumentStatus } from '@prisma/client';
import { IsNotEmpty, IsString, IsOptional, IsUUID, IsNumber, IsMimeType } from 'class-validator';
// import { DocumentStatus } from '../entities/document.entity';

export class CreateDocumentDto {
  @IsString({ message: 'Title must be a string.' })
  @IsNotEmpty({ message: 'Title cannot be empty.' })
  title: string;

  @IsString({ message: 'Description must be a string.' })
  @IsOptional()
  description?: string;

  // These fields are typically populated by the service after file upload, not directly from body
  // Hence, they are defined in CreateDocumentInternalDto
}
// Internal DTO used by service after file upload
export class CreateDocumentInternalDto extends CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsString()
  @IsNotEmpty()
  filePath: string;

  @IsMimeType()
  @IsNotEmpty()
  mimeType: string;

  @IsNumber()
  @IsNotEmpty()
  fileSize: number;

  @IsNumber()
  @IsNotEmpty()
  ownerId: number;

  @IsOptional()
  status?: DocumentStatus   ;
}