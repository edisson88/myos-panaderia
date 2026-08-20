// production.service.ts
import { Injectable } from '@nestjs/common';
import { ProductionRepository, UpsertProductionConfigInput } from './production.repository';

// ── Tipos de respuesta hacia el frontend ──────────────────────────────────────

export interface ProductionConfigItem {
  productId: string;
  productName: string;
  configId: string | null;
  saleUnitName: string | null;
  unitsPerTray: number | null;
  notes: string | null;
  hasConfig: boolean;
}

export interface UpsertConfigDto {
  productId: string;
  saleUnitName: string;
  unitsPerTray: number;
  notes?: string;
}

export interface DailyProductionItem {
  productId: string;
  productName: string;
  totalSaleUnits: number;      // ← renombrado (antes totalUnits)
  unitsPerSaleUnit: number;    // ← nuevo
  totalUnits: number;          // ← nuevo (unidades reales)
  saleUnitName: string | null;
  unitsPerTray: number | null;
  traysNeeded: number | null;
  hasConfig: boolean;
}

@Injectable()

export class ProductionService {
  constructor(
    private readonly productionRepository: ProductionRepository,
  ) { }

  private getCreatedDayRange(): { createdFrom: string; createdTo: string } {
    const now = new Date();

    const from = new Date(now);
    from.setHours(0, 0, 0, 0);

    const to = new Date(from);
    to.setDate(to.getDate() + 1);

    return {
      createdFrom: from.toISOString(),
      createdTo: to.toISOString(),
    };
  }

  private getTodayRange(): { today: string; tomorrow: string } {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(now);
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return {
      today: today.toISOString(),
      tomorrow: tomorrow.toISOString(),
    };
  }



  async getProductionConfig(): Promise<ProductionConfigItem[]> {
    const data = await this.productionRepository.getProductionConfig();

    return data.products.map((product) => ({
      productId: product.id,
      productName: product.name,
      configId: product.product_production_config?.id ?? null,
      saleUnitName: product.product_production_config?.sale_unit_name ?? null,
      unitsPerTray: product.product_production_config?.units_per_tray ?? null,
      notes: product.product_production_config?.notes ?? null,
      hasConfig: product.product_production_config !== null,
    }));
  }

  async upsertProductionConfig(dto: UpsertConfigDto): Promise<{ success: boolean }> {
    const input: UpsertProductionConfigInput = {
      product_id: dto.productId,
      sale_unit_name: dto.saleUnitName,
      units_per_tray: dto.unitsPerTray,
      notes: dto.notes,
    };

    await this.productionRepository.upsertProductionConfig(input);
    return { success: true };
  }

  async getDailyProduction(): Promise<DailyProductionItem[]> {
    const { createdFrom, createdTo } = this.getCreatedDayRange();
    const data = await this.productionRepository.getDailyProduction(
      createdFrom,
      createdTo,
    );

    const productMap = new Map<string, {
      name: string;
      totalUnits: number;
      unitsPerTray: number | null;
      unitsPerSaleUnit: number | null;
      saleUnitName: string | null;
    }>();

    for (const item of data.order_items) {
      if (!item.products?.[0]) continue;

      const existing = productMap.get(item.product_id);
      if (existing) {
        existing.totalUnits += item.quantity;
      } else {
        productMap.set(item.product_id, {
          name: item.products[0].name,
          totalUnits: item.quantity,
          unitsPerSaleUnit: item.products[0].units_per_sale_unit ?? 1, // ← agregar
          unitsPerTray: item.products[0].product_production_config?.units_per_tray ?? null,
          saleUnitName: item.products[0].product_production_config?.sale_unit_name ?? null,

        });
      }
    }

    return Array.from(productMap.entries()).map(([productId, data]) => {
      const totalRealUnits = data.totalUnits * (data.unitsPerSaleUnit ?? 1); // ← nuevo
      return {
        productId,
        productName: data.name,
        totalSaleUnits: data.totalUnits,          // ← bolsas/unidades pedidas
        unitsPerSaleUnit: data.unitsPerSaleUnit,  // ← unidades por bolsa
        totalUnits: totalRealUnits,               // ← unidades reales a producir
        saleUnitName: data.saleUnitName,
        unitsPerTray: data.unitsPerTray,
        traysNeeded: data.unitsPerTray && data.unitsPerTray > 0
          ? Math.ceil(totalRealUnits / data.unitsPerTray) // ← usa totalRealUnits
          : null,
        hasConfig: data.unitsPerTray !== null,
      };
    });
  }  
}