import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CustomersRepository } from './customers.repository';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { UserRole } from '../../common/enums/user-role.enum';

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  dni: string;
  active: boolean;
}

@Injectable()
export class CustomersService {
  constructor(
    private readonly customersRepository: CustomersRepository,
  ) {}

  /**
   * Returns the customer profile linked to the authenticated user.
   * Only users with role 'customer' have a customer profile.
   */
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
