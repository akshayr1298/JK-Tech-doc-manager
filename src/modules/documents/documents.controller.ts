import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guards';
import { DocumentsService } from './documents.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { User as UserDecoratorType } from 'src/common/decorators/user.decorator';
import { CreateDocumentDto } from './dto/create-document.dto';
import { User, Document as PrismaDocument } from '@prisma/client';
import { UserRole } from 'src/common/constants/roles.enum';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { Response } from 'express';
import { join } from 'path';
import { statSync } from 'fs';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.EDITOR) // Only Admin or Editor can upload
  @UseInterceptors(FileInterceptor('file')) // 'file' is the field name for the uploaded file
  @HttpCode(HttpStatus.CREATED)
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() createDocumentDto: CreateDocumentDto,
    @UserDecoratorType() user: User,
  ) {
    if (!file) {
      throw new Error('No file uploaded.');
    }
    return this.documentsService.create({
      ...createDocumentDto,
      filename: file.filename, // Multer renames the file, use its name
      filePath: file.path, // Full path where file is saved locally
      mimeType: file.mimetype,
      fileSize: file.size,
      ownerId: user.id, // Assign current user as owner
    });
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER) // All roles can list documents
  async findAll(
    @UserDecoratorType() user: User,
    // @Query('ownerId') ownerId?: string,
  ): Promise<PrismaDocument[]> {
    return this.documentsService.findAll(user.id);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER)
  async findOne(
    @Param('id') id: number,
    @UserDecoratorType() user: User,
  ): Promise<PrismaDocument> {
    const document = await this.documentsService.findById(id);
    if (user.role === UserRole.VIEWER && document.ownerId !== user.id) {
      throw new HttpException('Access Denied', HttpStatus.FORBIDDEN);
    }
    return document;
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR) 
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: number, 
    @Body() updateDocumentDto: UpdateDocumentDto,
    @UserDecoratorType() user: User, 
  ): Promise<PrismaDocument> {
    const document = await this.documentsService.findById(id);
    if (user.role === UserRole.EDITOR && document.ownerId !== user.id) {
      throw new HttpException('Access Denied', HttpStatus.FORBIDDEN);
    }
    return this.documentsService.update(id, updateDocumentDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN,UserRole.EDITOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: number,
    @UserDecoratorType() user: User,
  ): Promise<void> {
    const document = await this.documentsService.findById(id);
    if (user.role === UserRole.EDITOR && document.ownerId !== user.id) {
      throw new HttpException('Access Denied', HttpStatus.FORBIDDEN);
    }
    await this.documentsService.remove(id);
    return;
  }

  @Get(':id/download')
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER)
  async downloadDocument(
    @Param('id') id: number,
    @UserDecoratorType() user: User,
    @Res() res: Response,
  ): Promise<void> {
    const document = await this.documentsService.findById(id);

    if (document.ownerId !== user.id) {
      throw new HttpException('Access Denied', HttpStatus.FORBIDDEN);
    }
    const filePath = document.filePath;
    try {
      statSync(filePath); 
    } catch (error) {
      throw new NotFoundException(`File not found at ${document.filePath}`); 
    }

    res.setHeader('Content-Type', document.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${document.filename}"`,
    );
    res.download(filePath, document.filename);
  }
}
