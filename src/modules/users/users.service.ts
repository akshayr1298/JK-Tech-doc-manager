import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../config/database/prisma/prisma.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { User, UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser = await this.prisma.user.create({
      data: {
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        email: createUserDto.email,
        password: createUserDto.passwordHash,
        role: createUserDto.role
      },
    });

    return newUser;
  }

  async findAll({
    page,
    limit,
    search,
  }: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<Omit<User, 'password'>[]> {
    const skip = (page - 1) * limit;

    return this.prisma.user.findMany({
      where: {
        role: {
          in: ['VIEWER', 'EDITOR'],
        },
        ...(search && {
          firstName: {
            contains: search,
            mode: 'insensitive',
          },
        }),
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findById(id: number): Promise<Omit<User, 'password'>> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async updateRole(id: number, newRole: UserRole):Promise<Omit<User, 'password'>> {
    const user = await this.findById(id); // Check if user exists

    if (!Object.values(UserRole).includes(newRole)) {
      throw new BadRequestException(`Invalid role: ${newRole}`);
    }

    return this.prisma.user.update({
      where: { id },
      data: { role: newRole },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
  }

  async remove(id: number): Promise<void> {
    // id is now 'number'
    try {
      await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      // Prisma will throw P2025 (RecordNotFound) if ID doesn't exist for delete
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with ID ${id} not found.`);
      }
      throw error; // Re-throw other errors
    }
  }
}
