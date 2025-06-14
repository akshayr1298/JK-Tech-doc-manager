import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "../constants/roles.enum";
import { ROLES_KEY } from "../decorators/roles.decorator";



@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required roles from the route handler using the @Roles() decorator
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // If no roles are specified, allow access (authentication is handled by JwtAuthGuard)
    }

    const { user } = context.switchToHttp().getRequest();

    // Check if the user exists and has at least one of the required roles
    if (!user || !user.role || !requiredRoles.some((role) => user.role === role)) {
      throw new ForbiddenException('You do not have the necessary permissions (roles) to access this resource.');
    }

    return true; // User has the required role
  }
}