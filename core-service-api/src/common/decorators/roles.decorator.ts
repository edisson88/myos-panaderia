import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorator that restricts a route to specific roles.
 * Must be used together with RolesGuard.
 *
 * Usage:
 *   @Roles(UserRole.ADMIN, UserRole.STAFF)
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
