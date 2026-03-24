import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  // ── Admin endpoints ────────────────────────────────────────────────────────

  /**
   * GET /api/customers
   * Lista todos los clientes. Solo admin.
   */
  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.customersService.findAll();
  }

  /**
   * GET /api/customers/:id
   * Detalle de un cliente. Solo admin.
   */
  @Get(':id')
  @Roles(UserRole.ADMIN)
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.customersService.findById(id);
  }

  /**
   * POST /api/customers
   * Crear nuevo cliente. Solo admin.
   */
  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateCustomerDto) {
    return this.customersService.create(dto);
  }

  /**
   * PATCH /api/customers/:id
   * Actualizar cliente. Solo admin.
   */
  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customersService.update(id, dto);
  }

  /**
   * DELETE /api/customers/:id
   * Eliminar cliente. Solo admin.
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.customersService.remove(id);
  }

  // ── Customer self-service ──────────────────────────────────────────────────

  /**
   * GET /api/customers/me
   * Perfil del cliente autenticado. Solo rol customer.
   */
  @Get('me')
  @Roles(UserRole.CUSTOMER)
  getMyProfile(@CurrentUser() user: JwtPayload) {
    return this.customersService.getMyProfile(user);
  }
}

