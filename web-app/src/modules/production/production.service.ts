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

export interface DailyProductionItem {
  productId: string;
  productName: string;
  totalSaleUnits: number;
  unitsPerSaleUnit: number;
  totalUnits: number;
  saleUnitName: string | null;
  unitsPerTray: number | null;
  traysNeeded: number | null;
  hasConfig: boolean;
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

export async function fetchDailyProduction(
  token: string,
): Promise<DailyProductionItem[]> {
  return apiRequest<DailyProductionItem[]>(
    '/production/daily',
    { method: 'GET' },
    token,
  );
}