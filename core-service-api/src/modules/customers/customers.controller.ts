import { Controller, Get, UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  /**
   * GET /api/customers/me
   * Returns the customer profile linked to the authenticated user.
   * Restricted to users with role = 'customer'.
   */
  @Get('me')
  @Roles(UserRole.CUSTOMER)
  getMyProfile(@CurrentUser() user: JwtPayload) {
    return this.customersService.getMyProfile(user);
  }
}
