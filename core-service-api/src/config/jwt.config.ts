import { registerAs } from '@nestjs/config';

export interface JwtConfig {
  secret: string;
  expiresIn: string;
}

/**
 * Parses HASURA_GRAPHQL_JWT_SECRET which can be either:
 *   - A JSON string: {"type":"HS256","key":"the-actual-secret"}
 *   - A plain string secret (fallback)
 *
 * Hasura requires the JSON format. We extract only the `key` field
 * to use as the symmetric signing secret in NestJS JwtModule.
 */
function extractJwtSecret(raw: string): string {
  try {
    const parsed = JSON.parse(raw) as { type?: string; key?: string };
    if (!parsed.key) {
      throw new Error(
        'HASURA_GRAPHQL_JWT_SECRET JSON must contain a "key" field',
      );
    }
    return parsed.key;
  } catch {
    // If it's not valid JSON, treat the whole value as the secret
    return raw;
  }
}

/**
 * Namespaced config for JWT signing.
 * Access via: configService.get<string>('jwt.secret')
 */
export const jwtConfig = registerAs(
  'jwt',
  (): JwtConfig => ({
    secret: extractJwtSecret(process.env.HASURA_GRAPHQL_JWT_SECRET!),
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  }),
);
