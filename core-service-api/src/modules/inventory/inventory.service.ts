// inventory.service.ts
import { Injectable } from '@nestjs/common';
import { ProductionService } from '../production/production.service';
import {
  InventoryRepository,
  InventoryUpsertInput,
} from './inventory.repository';
import { ConfirmProductionDto } from './dto/confirm-production.dto';

// ── Tipos de respuesta hacia el frontend ──────────────────────────────────────

export interface ConfirmProductionResultItem {
  productId: string;
  productName: string;
  /** Sobrante en unidades crudas (panes/piezas), antes de convertir a unidad de venta. */
  surplusUnits: number;
  /** Sobrante en unidades de venta (bolsas/paquetes) — es lo que se suma al inventario. */
  surplusSaleUnits: number;
  newAvailableQuantity: number;
}

export interface ConfirmProductionResult {
  updated: ConfirmProductionResultItem[];
}

@Injectable()
export class InventoryService {
  constructor(
    private readonly productionService: ProductionService,
    private readonly inventoryRepository: InventoryRepository,
  ) {}

  async confirmProduction(
    dto: ConfirmProductionDto,
    userId: string,
  ): Promise<ConfirmProductionResult> {
    const dailyItems = await this.productionService.getDailyProduction(
      dto.dateFrom,
      dto.dateTo,
    );
    const dailyMap = new Map(dailyItems.map((item) => [item.productId, item]));

    const dateLabel =
      dto.dateFrom === dto.dateTo
        ? dto.dateFrom
        : `${dto.dateFrom} a ${dto.dateTo}`;

    // Solo se registra sobrante real: producción > lo requerido, y al menos
    // una unidad de venta completa (los sueltos que no alcanzan para una
    // bolsa/paquete completo no se guardan, tal como se calcula en la tabla).
    const candidates = dto.items.reduce<
      Array<{
        productId: string;
        productName: string;
        surplusUnits: number;
        surplusSaleUnits: number;
      }>
    >((acc, item) => {
      const daily = dailyMap.get(item.productId);
      if (!daily || !daily.hasConfig || !daily.unitsPerTray) return acc;

      const producedUnits = item.traysProduced * daily.unitsPerTray;
      const surplusUnits = producedUnits - daily.totalUnits;
      if (surplusUnits <= 0) return acc;

      const unitsPerSaleUnit = daily.unitsPerSaleUnit || 1;
      const surplusSaleUnits = Math.floor(surplusUnits / unitsPerSaleUnit);
      if (surplusSaleUnits <= 0) return acc;

      acc.push({
        productId: item.productId,
        productName: daily.productName,
        surplusUnits,
        surplusSaleUnits,
      });
      return acc;
    }, []);

    if (candidates.length === 0) {
      return { updated: [] };
    }

    const productIds = candidates.map((c) => c.productId);
    const currentQuantities =
      await this.inventoryRepository.getQuantities(productIds);

    const objects: InventoryUpsertInput[] = candidates.map((c) => {
      const previous = currentQuantities.get(c.productId) ?? 0;
      const next = previous + c.surplusSaleUnits;

      return {
        product_id: c.productId,
        available_quantity: next,
        reserved_quantity: 0,
        damaged_quantity: 0,
        minimum_stock: 0,
        active: true,
        finished_product_inventory_movements: {
          data: [
            {
              product_id: c.productId,
              movement_type: 'production_surplus',
              quantity: c.surplusSaleUnits,
              previous_available_quantity: previous,
              new_available_quantity: next,
              notes: `Sobrante de producción — ${dateLabel}`,
              reference_type: 'production',
              performed_by_user_id: userId,
            },
          ],
        },
      };
    });

    await this.inventoryRepository.confirmProduction(objects);

    return {
      updated: candidates.map((c) => ({
        productId: c.productId,
        productName: c.productName,
        surplusUnits: c.surplusUnits,
        surplusSaleUnits: c.surplusSaleUnits,
        newAvailableQuantity:
          (currentQuantities.get(c.productId) ?? 0) + c.surplusSaleUnits,
      })),
    };
  }
}
