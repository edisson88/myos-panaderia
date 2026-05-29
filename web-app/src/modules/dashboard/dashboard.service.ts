import {apiRequest} from '../../services/api';

// ── Tipos espejo del backend dashboard.service.ts ──────────────────────────────────────────────────
export interface DashboardKpis {
  completedOrders: number;
  dailyRevenue: number;
  dailyReturns: number;
}

export interface TopCustomer {
  name: string;
  total: number;
}

export interface TopProduct {
  name: string;
  total: number;
}

export interface DashboardSummary {
  kpis: DashboardKpis;
  topCustomers: TopCustomer[];
  topProducts: TopProduct[];
}

export interface DashboardOrderItem {
  id: string;
  productName: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface DashboardOrder  {
  id: string;
  orderCode: string;
  status: string;
  total: number;
  createdAt: string;
  deliveryDate: string | null;
  notes: string | null;
  customerName: string | null;
  customerPhone: string | null;
  customerAddress: string | null;
  items: DashboardOrderItem [];
}

export interface DashboardInventoryItem {
  id: string;
  productName: string;
  saleUnitName: string | null;
  availableQuantity: number;
  reservedQuantity: number;
  damagedQuantity: number;
  minimumStock: number;
  belowMinimum: boolean;
}

// ── API Calls ─────────────────────────────────────────────────────────────────

export async function fetchDashboardSummary(
    token: string,
): Promise<DashboardSummary> {
    return apiRequest<DashboardSummary>(
        '/dashboard/summary',
        {method: 'GET'},
        token,
    );
}

export async function fetchRecentOrders(
    token: string,
): Promise<DashboardOrder[]> {
    return apiRequest<DashboardOrder[]>(
        '/dashboard/recent-orders',
        {method: 'GET'},
        token,
    );
}

export async function fetchInventory(
    token: string,
): Promise<DashboardInventoryItem[]> {
    return apiRequest<DashboardInventoryItem[]>(
        '/dashboard/inventory',
        {method: 'GET'},
        token,
    );
}
