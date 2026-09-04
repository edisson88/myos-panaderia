// inventory.controller.ts
import {
  Controller,
  Post,
  Patch,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { ConfirmProductionDto } from './dto/confirm-production.dto';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
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

  /** PATCH /api/inventory/:inventoryId/quantity
   *  Ajusta manualmente la cantidad disponible de una fila de inventario
   *  (ej: conteo físico, corrección de error). Queda registrado en el
   *  historial de movimientos. Solo admin.
   */
  @Patch(':inventoryId/quantity')
  @Roles(UserRole.ADMIN)
  adjustQuantity(
    @Param('inventoryId', ParseUUIDPipe) inventoryId: string,
    @Body() dto: AdjustInventoryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.inventoryService.adjustAvailableQuantity(
      inventoryId,
      dto.availableQuantity,
      dto.notes,
      user.sub,
    );
  }
}
