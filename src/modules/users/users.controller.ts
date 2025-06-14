import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Put, UseGuards } from '@nestjs/common';
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
  async findAll() {
    // In a real app, you'd implement pagination and filtering
    const users = await this.usersService.findAll();
    // Exclude password hash from response
    return users.map(({ password, ...rest }) => rest);
  }
 @Get(':id')
  async findOne(@Param('id') id: number) {
    const user = await this.usersService.findById(id);
    // Exclude password hash from response
    const { password, ...result } = user;
    return result;
  }

  @Put(':id/role')
  @HttpCode(HttpStatus.OK)
  async updateRole(@Param('id') id: number, @Body() updateRoleDto: UpdateUserRoleDto):Promise<Omit<User, 'password'>> {
    const updatedUser = await this.usersService.updateRole(id, updateRoleDto.role);
    const { ...result } = updatedUser;
    return result;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content for successful deletion
  async remove(@Param('id') id: number) {
    await this.usersService.remove(id);
    return;
  }
    
}
