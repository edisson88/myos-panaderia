// web-app/src/modules/inventory/inventory.service.ts

import { apiRequest } from '../../services/api';

export interface ConfirmProductionItemPayload {
  productId: string;
  traysProduced: number;
}

export interface ConfirmProductionPayload {
  dateFrom: string;
  dateTo: string;
  items: ConfirmProductionItemPayload[];
}

export interface ConfirmProductionResultItem {
  productId: string;
  productName: string;
  /** Sobrante en unidades crudas (panes/piezas). */
  surplusUnits: number;
  /** Sobrante en unidades de venta (bolsas/paquetes) — lo que se sumó al inventario. */
  surplusSaleUnits: number;
  newAvailableQuantity: number;
}

export interface ConfirmProductionResult {
  updated: ConfirmProductionResultItem[];
}

export async function confirmProduction(
  payload: ConfirmProductionPayload,
  token: string,
): Promise<ConfirmProductionResult> {
  return apiRequest<ConfirmProductionResult>(
    '/inventory/confirm-production',
    { method: 'POST', body: JSON.stringify(payload) },
    token,
  );
}

export interface AdjustQuantityResult {
  productId: string;
  previousAvailableQuantity: number;
  newAvailableQuantity: number;
}

export async function adjustAvailableQuantity(
  inventoryId: string,
  availableQuantity: number,
  token: string,
  notes?: string,
): Promise<AdjustQuantityResult> {
  return apiRequest<AdjustQuantityResult>(
    `/inventory/${inventoryId}/quantity`,
    { method: 'PATCH', body: JSON.stringify({ availableQuantity, notes }) },
    token,
  );
}
