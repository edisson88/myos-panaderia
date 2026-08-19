// production.repository.ts
import { Injectable } from '@nestjs/common';
import { HasuraService } from '../../shared/hasura/hasura.service';
import { GET_PRODUCTION_CONFIG_QUERY } from './queries/get-production-config.query';
import { UPSERT_PRODUCTION_CONFIG_QUERY } from './queries/upsert-production-config.query';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface ProductionConfig {
  id: string;
  sale_unit_name: string;
  units_per_tray: number;
  notes: string | null;
}

interface ProductWithConfig {
  id: string;
  name: string;
  product_production_config: ProductionConfig | null;
}

export interface UpsertProductionConfigInput {
  product_id: string;
  sale_unit_name: string;
  units_per_tray: number;
  notes?: string;
}

@Injectable()
export class ProductionRepository {
  constructor(private readonly hasuraService: HasuraService) {}

  async getProductionConfig(): Promise<{ products: ProductWithConfig[] }> {
    return this.hasuraService.query<{ products: ProductWithConfig[] }>(
      GET_PRODUCTION_CONFIG_QUERY,
    );
  }

  async upsertProductionConfig(
    input: UpsertProductionConfigInput,
  ): Promise<{ insert_product_production_config_one: ProductionConfig }> {
    return this.hasuraService.query<{
      insert_product_production_config_one: ProductionConfig;
    }>(UPSERT_PRODUCTION_CONFIG_QUERY, {
      product_id: input.product_id,
      sale_unit_name: input.sale_unit_name,
      units_per_tray: input.units_per_tray,
      notes: input.notes ?? null,
    });
  }
}