import { apiRequest } from "../../services/api";
import type { OrderDetail, OrderListRow, OrdersFilters } from "./OrdersType";

// ── Shapes de respuesta del backend (espejo de HasuraOrderList / HasuraOrderDetail) ──

interface ApiOrderListItem {
    id: string;
    order_code: string;
    status: string;
    total: number;
    delivery_date: string | null;
    created_at: string;
    customer: { name: string } | null;
}

interface ApiOrderItem {
    id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    products: { name: string }[] | null;
}

interface ApiOrderDetail {
    id: string;
    order_code: string;
    status: string;
    total: number;
    delivery_date: string | null;
    notes: string | null;
    created_at: string;
    customer: { name: string } | null;
    order_items: ApiOrderItem[];
}

// ── Mappers ───────────────────────────────────────────────────────────────────

function mapToOrderListRow(item: ApiOrderListItem): OrderListRow {
    return {
        id: item.id,
        orderCode: item.order_code,
        customerName: item.customer?.name ?? "—",
        orderDate: item.created_at,
        deliveryDate: item.delivery_date,
        status: item.status,
        total: item.total,
    };
}

function mapToOrderDetail(item: ApiOrderDetail): OrderDetail {
    return {
        id: item.id,
        orderCode: item.order_code,
        customerName: item.customer?.name ?? "—",
        orderDate: item.created_at,
        deliveryDate: item.delivery_date,
        status: item.status,
        notes: item.notes,
        total: item.total,
        items: item.order_items.map((oi) => ({
            id: oi.id,
            productId: oi.product_id,
            productName: oi.products?.[0]?.name ?? "—",
            quantity: oi.quantity,
            unitPrice: oi.unit_price,
            subtotal: oi.subtotal,
        })),
    };
}

// ── API Calls ─────────────────────────────────────────────────────────────────

export async function fetchOrders(
    filters: OrdersFilters,
    token: string,
): Promise<OrderListRow[]> {
    const params = new URLSearchParams();
    if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.set("dateTo", filters.dateTo);
    if (filters.status) params.set("status", filters.status);
    if (filters.search) params.set("search", filters.search);

    const query = params.toString();
    const path = `/orders${query ? `?${query}` : ""}`;

    const data = await apiRequest<ApiOrderListItem[]>(path, { method: "GET" }, token);
    return data.map(mapToOrderListRow);
}

export async function fetchOrderById(
    id: string,
    token: string,
): Promise<OrderDetail> {
    const data = await apiRequest<ApiOrderDetail>(`/orders/${id}`, { method: "GET" }, token);
    return mapToOrderDetail(data);
}

// ── Tipos de input ─────────────────────────────────────────────────────────────

export interface CreateOrderItemInput {
    productId: string;
    quantity: number;
    unitPrice: number;
}

export interface CreateOrderInput {
    customerId: string;
    orderDate: string;
    deliveryDate?: string;
    notes?: string;
    items: CreateOrderItemInput[];
}

export async function createOrder(
    payload: CreateOrderInput,
    token: string,
): Promise<OrderDetail> {
    const data = await apiRequest<ApiOrderDetail>(
        "/orders",
        { method: "POST", body: JSON.stringify(payload) },
        token,
    );
    return mapToOrderDetail(data);
}

// ── Update ─────────────────────────────────────────────────────────────────────

export interface UpdateOrderInput {
    deliveryDate?: string;
    notes?: string;
    items?: Array<{ productId: string; quantity: number; unitPrice: number }>;
}

export async function updateOrder(
    id: string,
    payload: UpdateOrderInput,
    token: string,
): Promise<OrderDetail> {
    const data = await apiRequest<ApiOrderDetail>(
        `/orders/${id}`,
        { method: "PATCH", body: JSON.stringify(payload) },
        token,
    );
    return mapToOrderDetail(data);
}

export async function updateOrderStatus(
    id: string,
    status: string,
    token: string,
): Promise<OrderDetail> {
    const data = await apiRequest<ApiOrderDetail>(
        `/orders/${id}/status`,
        { method: "PATCH", body: JSON.stringify({ status }) },
        token,
    );
    return mapToOrderDetail(data);
}
