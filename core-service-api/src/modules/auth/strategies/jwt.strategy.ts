import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';

function extractSecretFromEnv(raw: string): string {
  try {
    const parsed = JSON.parse(raw) as { type?: string; key?: string };
    return parsed.key ?? raw;
  } catch {
    return raw;
  }
}

/**
 * Validates incoming Bearer tokens.
 * The decoded payload is attached to request.user for downstream use.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const raw = configService.get<string>('HASURA_GRAPHQL_JWT_SECRET')!;
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: extractSecretFromEnv(raw),
    });
  }

  /**
   * Called after token signature is verified.
   * The return value is set as request.user.
   */
  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
