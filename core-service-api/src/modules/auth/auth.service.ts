import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthRepository } from './auth.repository';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface MeResponse {
  id: string;
  name: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<LoginResponse> {
    // 1. Look up user by email
    const user = await this.authRepository.findByEmail(dto.email);

    if (!user) {
      // Do not reveal whether the email exists
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Check account status
    if (user.user_status !== 'active') {
      throw new UnauthorizedException('Account is inactive');
    }

    // 3. Verify password against bcrypt hash stored in DB
    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 4. Build JWT payload with Hasura claims
    const roleName = user.rol.name;
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: roleName,
      'https://hasura.io/jwt/claims': {
        'x-hasura-user-id': user.id,
        'x-hasura-default-role': roleName,
        'x-hasura-allowed-roles': [roleName],
      },
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: roleName,
      },
    };
  }

  getMe(user: JwtPayload): MeResponse {
    return {
      id: user.sub,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}
