import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from 'src/common/constants/roles.enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guards';
import { UsersService } from './users.service';
import { UpdateUserRoleDto } from './dtos/update-user.dto';
import { User } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard) // All routes in this controller require JWT auth and role check
@Roles(UserRole.ADMIN) // Only Admin can access User Management APIs
@Controller('users')
export class UsersController {
  
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(
    @Query('page', new ParseIntPipe()) page = 1,
    @Query('limit', new ParseIntPipe()) limit = 10,
    @Query('search') search?: string,
  ) {
    const pageNumber = page;
    const pageSize = limit;
 
    return this.usersService.findAll({
      page: pageNumber,
      limit: pageSize,
      search,
    });
    
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const result = await this.usersService.findById(id);
    return result;
  }

  @Put(':id/role')
  @HttpCode(HttpStatus.OK)
  async updateRole(
    @Param('id') id: number,
    @Body() updateRoleDto: UpdateUserRoleDto,
  ): Promise<{ message: string; user: Omit<User, 'password'> }> {
    const result = await this.usersService.updateRole(id, updateRoleDto.role);
    return {
      message: 'User role updated successfully',
      user: result,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) 
  async remove(@Param('id') id: number) {
    await this.usersService.remove(id);
    return;
  }
}
