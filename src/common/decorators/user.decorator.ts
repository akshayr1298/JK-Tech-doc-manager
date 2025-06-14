// src/common/decorators/user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
// import { User } from '../../modules/users/entities/user.entity'; // Make sure to import your User entity

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): any => {
    const request = ctx.switchToHttp().getRequest();
    // The user object is attached to 'request.user' by Passport.js after successful authentication
    return request.user;
  },
);