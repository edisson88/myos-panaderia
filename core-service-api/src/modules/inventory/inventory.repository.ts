// inventory.repository.ts
import { Injectable } from '@nestjs/common';
import { HasuraService } from '../../shared/hasura/hasura.service';
import {
  GET_INVENTORY_QUANTITIES,
  CONFIRM_PRODUCTION_INVENTORY,
} from './queries/inventory.queries';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface InventoryQuantityRow {
  product_id: string;
  available_quantity: number;
}

export interface InventoryMovementInsert {
  product_id: string;
  movement_type: string;
  quantity: number;
  previous_available_quantity: number;
  new_available_quantity: number;
  notes: string;
  reference_type: string;
  performed_by_user_id: string;
}

export interface InventoryUpsertInput {
  product_id: string;
  available_quantity: number;
  reserved_quantity: number;
  damaged_quantity: number;
  minimum_stock: number;
  active: boolean;
  finished_product_inventory_movements: {
    data: InventoryMovementInsert[];
  };
}

interface InventoryUpsertResult {
  id: string;
  product_id: string;
  available_quantity: number;
}

@Injectable()
export class InventoryRepository {
  constructor(private readonly hasuraService: HasuraService) {}

  async getQuantities(
    productIds: string[],
  ): Promise<Map<string, number>> {
    if (productIds.length === 0) return new Map();

    const result = await this.hasuraService.query<{
      product_inventory: InventoryQuantityRow[];
    }>(GET_INVENTORY_QUANTITIES, { productIds });

    return new Map(
      result.product_inventory.map((row) => [
        row.product_id,
        row.available_quantity,
      ]),
    );
  }

  async confirmProduction(
    objects: InventoryUpsertInput[],
  ): Promise<InventoryUpsertResult[]> {
    const result = await this.hasuraService.query<{
      insert_product_inventory: { returning: InventoryUpsertResult[] };
    }>(CONFIRM_PRODUCTION_INVENTORY, { objects });

    return result.insert_product_inventory.returning;
  }
}
