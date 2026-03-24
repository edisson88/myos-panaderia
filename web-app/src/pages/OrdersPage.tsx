import { Box } from "@mui/material";
import { useMemo, useState } from "react";

import OrdersFilters from "../modules/orders/components/OrdersFilters";
import OrdersKpis from "../modules/orders/components/OrdersKpis";
import OrdersTable from "../modules/orders/components/OrdersTable";
import OrderDetailDrawer from "../modules/orders/components/OrderDetailDrawer";

import type {
    OrderDetail,
    OrderListRow,
    OrdersFilters as OrdersFiltersType,
    OrdersKpi,
} from "../modules/orders/OrdersType";

const kpisMock: OrdersKpi[] = [
    { label: "Cantidad de pedidos", value: 18, helper: "Rango seleccionado", chipLabel: "Hoy", chipColor: "success" },
    { label: "Total ingresos", value: "$ 1.245.000", helper: "Estimado", chipLabel: "Pendiente", chipColor: "warning" },
    { label: "Producto más vendido", value: "Pan campesino", helper: "Por unidades", chipLabel: "Top", chipColor: "success" },
    { label: "Producto menos vendido", value: "Croissant", helper: "Por unidades", chipLabel: "Bajo", chipColor: "default" },
];

const rowsMock: OrderListRow[] = [
    {
        id: "1",
        orderCode: "ORD-0001",
        customerName: "María Cárdenas",
        orderDate: "22/02/2026",
        deliveryDate: "22/02/2026",
        status: "in_production",
        total: 98000,
    },
    {
        id: "2",
        orderCode: "ORD-0002",
        customerName: "Café Niza",
        orderDate: "22/02/2026",
        deliveryDate: "23/02/2026",
        status: "confirmed",
        total: 245000,
    },
    {
        id: "3",
        orderCode: "ORD-0003",
        customerName: "Juan Rojas",
        orderDate: "21/02/2026",
        deliveryDate: null,
        status: "delivered",
        total: 42500,
    },
];

const detailsMockById: Record<string, OrderDetail> = {
    "1": {
        id: "1",
        orderCode: "ORD-0001",
        customerName: "María Cárdenas",
        orderDate: "22/02/2026",
        deliveryDate: "22/02/2026",
        status: "in_production",
        notes: "Entregar en portería. Llamar al llegar.",
        total: 98000,
        items: [
            { id: "1-1", productName: "Pan campesino", quantity: 4, unitPrice: 8000, subtotal: 32000 },
            { id: "1-2", productName: "Almojábana", quantity: 10, unitPrice: 3200, subtotal: 32000 },
            { id: "1-3", productName: "Galletas avena", quantity: 5, unitPrice: 6800, subtotal: 34000 },
        ],
    },
    "2": {
        id: "2",
        orderCode: "ORD-0002",
        customerName: "Café Niza",
        orderDate: "22/02/2026",
        deliveryDate: "23/02/2026",
        status: "confirmed",
        notes: null,
        total: 245000,
        items: [
            { id: "2-1", productName: "Croissant", quantity: 30, unitPrice: 4500, subtotal: 135000 },
            { id: "2-2", productName: "Pan brioche", quantity: 20, unitPrice: 5500, subtotal: 110000 },
        ],
    },
    "3": {
        id: "3",
        orderCode: "ORD-0003",
        customerName: "Juan Rojas",
        orderDate: "21/02/2026",
        deliveryDate: null,
        status: "delivered",
        notes: "Pago contra entrega.",
        total: 42500,
        items: [
            { id: "3-1", productName: "Pan de queso", quantity: 10, unitPrice: 2500, subtotal: 25000 },
            { id: "3-2", productName: "Mogolla", quantity: 5, unitPrice: 3500, subtotal: 17500 },
        ],
    },
};

export default function OrdersPage() {
    const [filters, setFilters] = useState<OrdersFiltersType>({
        dateFrom: null,
        dateTo: null,
        search: "",
        status: null,
    });

    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);

    const handleApply = () => {
        // MVP: solo para verificar flujo. Luego aquí disparamos refetch con variables.
        console.log("Apply filters:", filters);
    };

    const handleClear = () => {
        setFilters({ dateFrom: null, dateTo: null, search: "", status: null });
    };

    const handleViewDetail = (orderId: string) => {
        const found = detailsMockById[orderId] ?? null;
        setSelectedOrder(found);
        setDetailOpen(true);
    };

    const handleCloseDetail = () => {
        setDetailOpen(false);
        // opcional: limpiar al cerrar
        // setSelectedOrder(null);
    };

    // Por ahora la tabla muestra mocks. Luego filtramos con queries.
    const tableRows = useMemo(() => rowsMock, []);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

            <OrdersFilters value={filters} onChange={setFilters} onApply={handleApply} onClear={handleClear} />

            <OrdersKpis kpis={kpisMock} />

            <OrdersTable rows={tableRows} onViewDetail={handleViewDetail} />

            <OrderDetailDrawer open={detailOpen} onClose={handleCloseDetail} order={selectedOrder} />
        </Box>
    );
}