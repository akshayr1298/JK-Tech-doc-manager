import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/config/database/prisma/prisma.service";
import { CreateDocumentInternalDto } from "./dto/create-document.dto";
import { Document, DocumentStatus, Prisma } from "@prisma/client";
import { UpdateDocumentDto } from "./dto/update-document.dto";
import { join } from "path";
import * as fs from 'fs';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);
  constructor(
    private prisma: PrismaService, 
  ) {}

  async create(createDocumentDto: CreateDocumentInternalDto): Promise<Document> {
    
    return this.prisma.document.create({
      data: {
        title: createDocumentDto.title,
        description: createDocumentDto.description,
        filename: createDocumentDto.filename,
        filePath: createDocumentDto.filePath,
        mimeType: createDocumentDto.mimeType,
        fileSize: createDocumentDto.fileSize,
        status: createDocumentDto.status || DocumentStatus.PENDING_UPLOAD, 
        owner: { connect: { id: createDocumentDto.ownerId } }, 
      },
    });
  }

  async findAll(ownerId?: number): Promise<Document[]> { 
    const whereClause: Prisma.DocumentWhereInput = {};
    if (ownerId) {
      whereClause.ownerId = ownerId;
    }
    // Prisma's findMany method
    return this.prisma.document.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllByOwner(ownerId: number): Promise<Document[]> { 
    return this.prisma.document.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: number): Promise<Document> { 
    const document = await this.prisma.document.findUnique({
      where: { id },
    });
    if (!document) {
      this.logger.warn(`Document with ID ${id} not found.`)
      throw new NotFoundException(`Document with ID ${id} not found.`);
    }
    return document;
  }

  async update(id: number, updateDocumentDto: UpdateDocumentDto): Promise<Document> { 
    const document = await this.findById(id); 

    return this.prisma.document.update({
      where: { id },
      data: updateDocumentDto, 
    });
  }

  async updateStatus(id: number, status: DocumentStatus): Promise<Document> { 
    const document = await this.findById(id); 
    return this.prisma.document.update({
      where: { id },
      data: { status },
    });
  }

  async remove(id: number): Promise<void> {
  try {
    const document = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      this.logger.warn(`Document with ID ${id} not found.`)
      throw new NotFoundException(`Document with ID ${id} not found.`);
    }
    await this.prisma.document.delete({
      where: { id },
    });

    const filePath = join(process.cwd(), 'uploads', document.filename); 
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      this.logger.warn(`Document with ID ${id} not found.Error ${error?.message}`)
      throw new NotFoundException(`Document with ID ${id} not found.`);
    }
    throw error;
  }
}

}
