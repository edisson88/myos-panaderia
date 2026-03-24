import { Injectable } from '@nestjs/common';
import { HasuraService } from '../../shared/hasura/hasura.service';

const GET_CUSTOMER_BY_USER_ID = `
  query GetCustomerByUserId($userId: uuid!) {
    customers(where: { user_id: { _eq: $userId } }) {
      id
      name
      phone
      address
      email
      dni
      active
      user_id
    }
  }
`;

export interface HasuraCustomer {
  id: string;
  name: string;
  phone: string;
  address: string;
  email: string;
  dni: string;
  active: boolean;
  user_id: string;
}

interface GetCustomerByUserIdResponse {
  customers: HasuraCustomer[];
}

@Injectable()
export class CustomersRepository {
  constructor(private readonly hasuraService: HasuraService) {}

  async findByUserId(userId: string): Promise<HasuraCustomer | null> {
    const result =
      await this.hasuraService.query<GetCustomerByUserIdResponse>(
        GET_CUSTOMER_BY_USER_ID,
        { userId },
      );
    return result.customers[0] ?? null;
  }
}
