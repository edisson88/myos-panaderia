import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HasuraService } from './hasura.service';

/**
 * @Global makes HasuraService available throughout the application
 * without needing to import HasuraModule in every feature module.
 */
@Global()
@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 3,
    }),
  ],
  providers: [HasuraService],
  exports: [HasuraService],
})
export class HasuraModule {}
