// web-app/src/modules/production/production.service.ts

import { apiRequest } from '../../services/api';

export interface ProductionConfigItem {
  productId: string;
  productName: string;
  configId: string | null;
  saleUnitName: string | null;
  unitsPerTray: number | null;
  notes: string | null;
  hasConfig: boolean;
}

export interface UpsertConfigPayload {
  productId: string;
  saleUnitName: string;
  unitsPerTray: number;
  notes?: string;
}

export async function fetchProductionConfig(
  token: string,
): Promise<ProductionConfigItem[]> {
  return apiRequest<ProductionConfigItem[]>(
    '/production/config',
    { method: 'GET' },
    token,
  );
}

export async function upsertProductionConfig(
  payload: UpsertConfigPayload,
  token: string,
): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>(
    '/production/config',
    { method: 'POST', body: JSON.stringify(payload) },
    token,
  );
}