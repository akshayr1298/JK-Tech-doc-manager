import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";


@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt'){
   
    constructor(private reflector:Reflector){
        super()
    }
    
    canActivate(context: ExecutionContext) {
    // Check if the route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true; // Allow access if public
    }
    // Otherwise, proceed with JWT authentication
    return super.canActivate(context);
  }
  
  // Handle authentication request errors (optional, but good for custom error messages)
  handleRequest(err, user, info) {
    // You can throw an exception based on the error or user status
    if (err || !user) {
      throw err || new UnauthorizedException('Authentication failed or token invalid');
    }
    return user;
  }
}