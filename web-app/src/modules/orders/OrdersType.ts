// -----------------------------
// Filtros
// -----------------------------
export type OrdersFilters = {
    dateFrom: string | null; // YYYY-MM-DD
    dateTo: string | null;   // YYYY-MM-DD
    search?: string;         // opcional: cliente o código
    status?: string | null;  // opcional
};

// -----------------------------
// KPI Cards
// -----------------------------
export type OrdersKpi = {
    label: string;
    value: string | number;
    helper?: string;
    chipLabel?: string;
    chipColor?: "success" | "warning" | "error" | "default";
};

// -----------------------------
// Tabla principal (listado)
// -----------------------------
export type OrderListRow = {
    id: string;              // orders.id (uuid)
    customerName: string;    // customers.name
    orderDate: string;       // orders.created_at (ISO)
    deliveryDate?: string | null; // orders.delivery_datw (ISO) - si lo usas
    status: string;          // orders.status (text)
    total: number;
    orderCode: string;           // orders.total (numeric)
};

// -----------------------------
// Items del pedido (detalle)
// -----------------------------
export type OrderItem = {
    id: string;              // order_items.id
    productId: string;       // order_items.product_id
    productName: string;     // products.name
    quantity: number;        // viene de order_items.quatity (numeric) -> lo mapeas
    unitPrice: number;       // order_items.unit_price (numeric)
    subtotal: number;        // order_items.subtotal (numeric)
};

// -----------------------------
// Detalle del pedido
// -----------------------------
export type OrderDetail = {
    id: string;
    orderCode: string;
    customerName: string;
    orderDate: string;
    deliveryDate?: string | null;
    status: string;
    notes?: string | null;   // orders.notes
    total: number;
    items: OrderItem[];
};