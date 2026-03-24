import { Injectable } from '@nestjs/common';
import { HasuraService } from '../../shared/hasura/hasura.service';
import {
  GET_ALL_CUSTOMERS,
  GET_CUSTOMER_BY_ID,
  GET_CUSTOMER_BY_USER_ID,
  INSERT_CUSTOMER,
  UPDATE_CUSTOMER,
  DELETE_CUSTOMER,
} from './customers.queries';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

export interface HasuraCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  dni: string | null;
  active: boolean;
  user_id: string | null;
  created_at?: string;
  updated_at?: string;
}

interface GetAllCustomersResponse {
  customers: HasuraCustomer[];
}

interface GetCustomerByIdResponse {
  customers_by_pk: HasuraCustomer | null;
}

interface GetCustomerByUserIdResponse {
  customers: HasuraCustomer[];
}

interface InsertCustomerResponse {
  insert_customers_one: HasuraCustomer;
}

interface UpdateCustomerResponse {
  update_customers_by_pk: HasuraCustomer;
}

interface DeleteCustomerResponse {
  delete_customers_by_pk: { id: string };
}

@Injectable()
export class CustomersRepository {
  constructor(private readonly hasuraService: HasuraService) {}

  async findAll(): Promise<HasuraCustomer[]> {
    const result =
      await this.hasuraService.query<GetAllCustomersResponse>(
        GET_ALL_CUSTOMERS,
      );
    return result.customers;
  }

  async findById(id: string): Promise<HasuraCustomer | null> {
    const result =
      await this.hasuraService.query<GetCustomerByIdResponse>(
        GET_CUSTOMER_BY_ID,
        { id },
      );
    return result.customers_by_pk ?? null;
  }

  async findByUserId(userId: string): Promise<HasuraCustomer | null> {
    const result =
      await this.hasuraService.query<GetCustomerByUserIdResponse>(
        GET_CUSTOMER_BY_USER_ID,
        { userId },
      );
    return result.customers[0] ?? null;
  }

  async create(dto: CreateCustomerDto): Promise<HasuraCustomer> {
    const result =
      await this.hasuraService.query<InsertCustomerResponse>(
        INSERT_CUSTOMER,
        {
          name: dto.name,
          email: dto.email,
          phone: dto.phone,
          address: dto.address,
          dni: dto.dni ?? null,
          active: dto.active ?? true,
          user_id: dto.user_id ?? null,
        },
      );
    return result.insert_customers_one;
  }

  async update(id: string, dto: UpdateCustomerDto): Promise<HasuraCustomer> {
    const result =
      await this.hasuraService.query<UpdateCustomerResponse>(
        UPDATE_CUSTOMER,
        { id, ...dto },
      );
    return result.update_customers_by_pk;
  }

  async remove(id: string): Promise<{ id: string }> {
    const result =
      await this.hasuraService.query<DeleteCustomerResponse>(
        DELETE_CUSTOMER,
        { id },
      );
    return result.delete_customers_by_pk;
  }
}

