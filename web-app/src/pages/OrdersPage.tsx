import { Alert, Box, CircularProgress, Stack } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import OrdersFilters from "../modules/orders/components/OrdersFilters";
import OrdersKpis from "../modules/orders/components/OrdersKpis";
import OrdersTable from "../modules/orders/components/OrdersTable";
import OrderDetailDrawer from "../modules/orders/components/OrderDetailDrawer";
import CreateOrderDialog from "../modules/orders/components/CreateOrderDialog";
import { fetchOrders, fetchOrderById } from "../modules/orders/orders.service";
import { useAuth } from "../hooks/useAuth";

import type {
    OrderDetail,
    OrderListRow,
    OrdersFilters as OrdersFiltersType,
    OrdersKpi,
} from "../modules/orders/OrdersType";

// ── KPIs derivados de la lista cargada ───────────────────────────────────────

function computeKpis(rows: OrderListRow[]): OrdersKpi[] {
    const total = rows.reduce((sum, r) => sum + r.total, 0);
    const formattedTotal = new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
    }).format(total);

    const byStatus = (s: string) => rows.filter((r) => r.status === s).length;

    return [
        {
            label: "Cantidad de pedidos",
            value: rows.length,
            helper: "Rango seleccionado",
            chipLabel: "Total",
            chipColor: "default",
        },
        {
            label: "Total ingresos",
            value: formattedTotal,
            helper: "Suma del período",
            chipLabel: "Estimado",
            chipColor: "warning",
        },
        {
            label: "En producción",
            value: byStatus("in_production"),
            helper: "Pedidos activos",
            chipLabel: "Activo",
            chipColor: "warning",
        },
        {
            label: "Entregados",
            value: byStatus("delivered"),
            helper: "Completados en el período",
            chipLabel: "OK",
            chipColor: "success",
        },
    ];
}

const DEFAULT_FILTERS: OrdersFiltersType = {
    dateFrom: null,
    dateTo: null,
    search: "",
    status: null,
};

export default function OrdersPage() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [filters, setFilters] = useState<OrdersFiltersType>(DEFAULT_FILTERS);
    const [appliedFilters, setAppliedFilters] = useState<OrdersFiltersType>(DEFAULT_FILTERS);

    const [rows, setRows] = useState<OrderListRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState<string | null>(null);
    const [editModeOnOpen, setEditModeOnOpen] = useState(false);

    // Dialog de creación — se abre cuando el Topbar navega con ?openModal=true
    const [createOpen, setCreateOpen] = useState(false);

    useEffect(() => {
        if (searchParams.get("openModal") === "true") {
            setCreateOpen(true);
            // Limpia el query param sin recargar
            navigate("/pedidos", { replace: true });
        }
    }, [searchParams, navigate]);

    const loadOrders = useCallback(
        async (f: OrdersFiltersType) => {
            if (!token) return;
            setLoading(true);
            setError(null);
            try {
                const data = await fetchOrders(f, token);
                setRows(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Error al cargar pedidos");
            } finally {
                setLoading(false);
            }
        },
        [token],
    );

    useEffect(() => {
        loadOrders(appliedFilters);
    }, [loadOrders, appliedFilters]);

    const handleApply = () => {
        setAppliedFilters(filters);
    };

    const handleClear = () => {
        setFilters(DEFAULT_FILTERS);
        setAppliedFilters(DEFAULT_FILTERS);
    };

    const handleViewDetail = async (orderId: string) => {
        if (!token) return;
        setSelectedOrder(null);
        setDetailError(null);
        setEditModeOnOpen(false);
        setDetailOpen(true);
        setDetailLoading(true);
        try {
            const detail = await fetchOrderById(orderId, token);
            setSelectedOrder(detail);
        } catch (err) {
            setDetailError(err instanceof Error ? err.message : "Error al cargar el pedido");
        } finally {
            setDetailLoading(false);
        }
    };

    const handleEditOrder = async (orderId: string) => {
        if (!token) return;
        setSelectedOrder(null);
        setDetailError(null);
        setEditModeOnOpen(true);
        setDetailOpen(true);
        setDetailLoading(true);
        try {
            const detail = await fetchOrderById(orderId, token);
            setSelectedOrder(detail);
        } catch (err) {
            setDetailError(err instanceof Error ? err.message : "Error al cargar el pedido");
        } finally {
            setDetailLoading(false);
        }
    };

    const handleCloseDetail = () => {
        setDetailOpen(false);
        setSelectedOrder(null);
        setDetailError(null);
        setEditModeOnOpen(false);
    };

    const refreshDetail = useCallback(async (orderId: string) => {
        if (!token) return;
        setDetailLoading(true);
        try {
            const detail = await fetchOrderById(orderId, token);
            setSelectedOrder(detail);
        } catch {
            // no bloquear la vista si falla el re-fetch
        } finally {
            setDetailLoading(false);
        }
    }, [token]);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <OrdersFilters value={filters} onChange={setFilters} onApply={handleApply} onClear={handleClear} />

            {error && (
                <Alert severity="error" sx={{ borderRadius: 0 }}>
                    {error}
                </Alert>
            )}

            <OrdersKpis kpis={computeKpis(rows)} />

            {loading ? (
                <Stack alignItems="center" py={5}>
                    <CircularProgress size={32} />
                </Stack>
            ) : (
                <OrdersTable rows={rows} onViewDetail={handleViewDetail} onEdit={handleEditOrder} />
            )}

            <OrderDetailDrawer
                open={detailOpen}
                onClose={handleCloseDetail}
                order={selectedOrder}
                loading={detailLoading}
                error={detailError}
                openInEditMode={editModeOnOpen}
                onUpdated={() => {
                    loadOrders(appliedFilters);
                    if (selectedOrder) refreshDetail(selectedOrder.id);
                }}
            />

            <CreateOrderDialog
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onCreated={() => {
                    setCreateOpen(false);
                    loadOrders(appliedFilters);
                }}
            />
        </Box>
    );
}
