// inventory.controller.ts
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { ConfirmProductionDto } from './dto/confirm-production.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  /** POST /api/inventory/confirm-production
   *  Calcula el sobrante de producción del día (latas producidas x unidades
   *  por lata, menos lo requerido por los pedidos) y lo suma al inventario
   *  disponible de cada producto. Solo admin.
   */
  @Post('confirm-production')
  @Roles(UserRole.ADMIN)
  confirmProduction(
    @Body() dto: ConfirmProductionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.inventoryService.confirmProduction(dto, user.sub);
  }
}
