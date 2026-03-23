import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // ── App ─────────────────────────────────────────────────────────────────
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  PORT: Joi.number().integer().min(1).max(65535).default(4000),

  // ── Hasura ───────────────────────────────────────────────────────────────
  HASURA_GRAPHQL_ENDPOINT: Joi.string().uri().required().messages({
    'any.required': 'HASURA_GRAPHQL_ENDPOINT is required',
    'string.uri': 'HASURA_GRAPHQL_ENDPOINT must be a valid URI',
  }),

  HASURA_ADMIN_SECRET: Joi.string().min(1).required().messages({
    'any.required': 'HASURA_ADMIN_SECRET is required',
  }),

  // Should be the full Hasura JWT JSON config: {"type":"HS256","key":"..."}
  HASURA_GRAPHQL_JWT_SECRET: Joi.string().min(1).required().messages({
    'any.required': 'HASURA_GRAPHQL_JWT_SECRET is required',
  }),

  // ── JWT ──────────────────────────────────────────────────────────────────
  JWT_EXPIRES_IN: Joi.string().default('1d'),
  DEFAULT_ROLE: Joi.string().default('user'),

  // ── CORS ─────────────────────────────────────────────────────────────────
  // Required in production, optional in development
  ALLOWED_ORIGINS: Joi.when('NODE_ENV', {
    is: 'production',
    then: Joi.string().min(1).required().messages({
      'any.required': 'ALLOWED_ORIGINS is required in production',
    }),
    otherwise: Joi.string().default('http://localhost:3000'),
  }),
});
