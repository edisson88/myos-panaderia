import { Injectable } from '@nestjs/common';
import { HasuraService } from '../../shared/hasura/hasura.service';

const GET_USER_BY_EMAIL = `
  query GetUserByEmail($email: String!) {
    user(where: { email: { _eq: $email } }) {
      id
      name
      email
      password
      user_status
      rol {
        id
        name
      }
    }
  }
`;

export interface HasuraUserRol {
  id: number;
  name: string;
}

export interface HasuraUser {
  id: string;
  name: string;
  email: string;
  password: string;
  user_status: string;
  rol: HasuraUserRol;
}

interface GetUserByEmailResponse {
  user: HasuraUser[];
}

@Injectable()
export class AuthRepository {
  constructor(private readonly hasuraService: HasuraService) {}

  async findByEmail(email: string): Promise<HasuraUser | null> {
    const result = await this.hasuraService.query<GetUserByEmailResponse>(
      GET_USER_BY_EMAIL,
      { email },
    );
    return result.user[0] ?? null;
  }
}
