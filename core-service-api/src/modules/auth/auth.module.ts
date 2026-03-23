import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { JwtStrategy } from './strategies/jwt.strategy';

function extractJwtSecret(raw: string): string {
  try {
    const parsed = JSON.parse(raw) as { type?: string; key?: string };
    return parsed.key ?? raw;
  } catch {
    return raw;
  }
}

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const raw = configService.get<string>('HASURA_GRAPHQL_JWT_SECRET')!;
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN') ?? '1d';
        return {
          secret: extractJwtSecret(raw),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          signOptions: { expiresIn: expiresIn as any },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, JwtStrategy],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
