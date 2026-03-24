import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CustomersRepository } from './customers.repository';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { UserRole } from '../../common/enums/user-role.enum';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { HasuraCustomer } from './customers.repository';

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  dni: string | null;
  active: boolean;
}

@Injectable()
export class CustomersService {
  constructor(
    private readonly customersRepository: CustomersRepository,
  ) {}

  // ── Admin CRUD ─────────────────────────────────────────────────────────────

  async findAll(): Promise<HasuraCustomer[]> {
    return this.customersRepository.findAll();
  }

  async findById(id: string): Promise<HasuraCustomer> {
    const customer = await this.customersRepository.findById(id);
    if (!customer) {
      throw new NotFoundException(`Customer with id ${id} not found`);
    }
    return customer;
  }

  async create(dto: CreateCustomerDto): Promise<HasuraCustomer> {
    return this.customersRepository.create(dto);
  }

  async update(id: string, dto: UpdateCustomerDto): Promise<HasuraCustomer> {
    await this.findById(id); // ensures the record exists before updating
    return this.customersRepository.update(id, dto);
  }

  async remove(id: string): Promise<{ id: string }> {
    await this.findById(id); // ensures the record exists before deleting
    return this.customersRepository.remove(id);
  }

  // ── Customer self-service ──────────────────────────────────────────────────

  async getMyProfile(user: JwtPayload): Promise<CustomerProfile> {
    if (user.role !== UserRole.CUSTOMER) {
      throw new ForbiddenException(
        'This endpoint is only available for customers',
      );
    }

    const customer = await this.customersRepository.findByUserId(user.sub);

    if (!customer) {
      throw new NotFoundException(
        'No customer profile found for this account',
      );
    }

    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      dni: customer.dni,
      active: customer.active,
    };
  }
}

