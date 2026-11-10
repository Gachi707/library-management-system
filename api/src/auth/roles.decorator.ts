import { SetMetadata } from '@nestjs/common';
import type { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

// Tags a route with the role(s) allowed to call it; RolesGuard reads the tag back
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
