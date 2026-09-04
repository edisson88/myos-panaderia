// inventory.repository.ts
import { Injectable } from '@nestjs/common';
import { HasuraService } from '../../shared/hasura/hasura.service';
import {
  GET_INVENTORY_QUANTITIES,
  GET_INVENTORY_BY_ID,
  UPSERT_INVENTORY_WITH_MOVEMENT,
} from './queries/inventory.queries';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface InventoryQuantityRow {
  product_id: string;
  available_quantity: number;
}

interface InventoryRow {
  id: string;
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

  async getById(id: string): Promise<InventoryRow | null> {
    const result = await this.hasuraService.query<{
      product_inventory_by_pk: InventoryRow | null;
    }>(GET_INVENTORY_BY_ID, { id });

    return result.product_inventory_by_pk;
  }

  async upsertWithMovement(
    objects: InventoryUpsertInput[],
  ): Promise<InventoryUpsertResult[]> {
    const result = await this.hasuraService.query<{
      insert_product_inventory: { returning: InventoryUpsertResult[] };
    }>(UPSERT_INVENTORY_WITH_MOVEMENT, { objects });

    return result.insert_product_inventory.returning;
  }
}
