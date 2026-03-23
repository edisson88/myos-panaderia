import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Validates the Bearer JWT token on the Authorization header.
 * Delegates to JwtStrategy.validate() — attaches the decoded payload
 * to request.user if valid, throws 401 if missing or invalid.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
