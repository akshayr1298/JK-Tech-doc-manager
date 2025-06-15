import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "../constants/roles.enum";
import { ROLES_KEY } from "../decorators/roles.decorator";



@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; 
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.role || !requiredRoles.some((role) => user.role === role)) {
      throw new ForbiddenException("Access denied You don't have permission to access this page.");
    }
    return true; 
  }
}