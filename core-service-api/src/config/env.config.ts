import { ConfigModuleOptions } from '@nestjs/config';
import { validationSchema } from './env.validation';

export const envConfig: ConfigModuleOptions = {
  isGlobal: true,
  envFilePath: '.env',
  validationSchema,
  validationOptions: {
    // Stop at first missing/invalid variable to surface the exact problem quickly
    abortEarly: true,
  },
};
