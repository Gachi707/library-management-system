import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// What JwtStrategy.validate() puts on req.user
export interface AuthUser {
  userId: number;
  role: string;
}

// Use as @CurrentUser() user: AuthUser. The caller's id always comes from the verified JWT,
// never from the request body, so a patron cannot act as someone else.
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): AuthUser => {
  return ctx.switchToHttp().getRequest().user;
});
