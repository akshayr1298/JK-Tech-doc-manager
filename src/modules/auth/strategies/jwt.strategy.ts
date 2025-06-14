import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
// import { User } from '../../users/entities/user.entity'; // Make sure this import is uncommented and correct

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private authService: AuthService,
  ) {
    // Retrieve the JWT_SECRET from ConfigService
    const jwtSecret = config.get<string>('JWT_SECRET');    

    // Crucial check: Ensure JWT_SECRET is defined.
    // If it's not set, the application should not start or should throw a clear error.
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in the environment variables.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract JWT from Authorization header as Bearer token
      ignoreExpiration: false, // Do not ignore token expiration (tokens will expire based on 'expiresIn')
      secretOrKey: jwtSecret, // Now guaranteed to be a string
    });
  }

  // This method is called after the JWT has been validated by Passport-JWT.
  // The 'payload' is the decoded JWT payload.
  async validate(payload: any): Promise<any> { // Changed to Promise<User> for better type safety     
    // 'payload.sub' is the user ID (subject) from the JWT
    // 'payload.email' and 'payload.role' are also available
    const user = await this.authService.validateUser(payload);    
    if (!user) {
      throw new UnauthorizedException('User not found or inactive.');
    }
    return user; // This user object will be attached to `req.user`
  }
}