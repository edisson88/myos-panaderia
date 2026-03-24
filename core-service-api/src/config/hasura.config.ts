import { registerAs } from '@nestjs/config';

export interface HasuraConfig {
  endpoint: string;
  adminSecret: string;
}

/**
 * Namespaced config for Hasura connection.
 * Access via: configService.get<string>('hasura.endpoint')
 */
export const hasuraConfig = registerAs(
  'hasura',
  (): HasuraConfig => ({
    endpoint: process.env.HASURA_GRAPHQL_ENDPOINT!,
    adminSecret: process.env.HASURA_ADMIN_SECRET!,
  }),
);
