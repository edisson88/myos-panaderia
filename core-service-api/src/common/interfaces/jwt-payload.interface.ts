export interface HasuraClaims {
  'x-hasura-user-id': string;
  'x-hasura-default-role': string;
  'x-hasura-allowed-roles': string[];
}

/**
 * Shape of the JWT payload signed and verified by NestJS.
 * The `https://hasura.io/jwt/claims` namespace is required by Hasura
 * to apply row-level permissions on behalf of the user.
 */
export interface JwtPayload {
  /** user.id (uuid) */
  sub: string;
  email: string;
  name: string;
  /** rol.name (admin | staff | customer) */
  role: string;
  'https://hasura.io/jwt/claims': HasuraClaims;
  iat?: number;
  exp?: number;
}
