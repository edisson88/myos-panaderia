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

@Injectable()
export class ProductionService {
  constructor(
    private readonly productionRepository: ProductionRepository,
  ) {}

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
}