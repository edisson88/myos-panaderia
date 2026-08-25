import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
  Chip,
  Divider,
  Table,
  Button,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Skeleton,
  Collapse,
  IconButton,
  Alert,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { useDashboard } from "../modules/dashboard/useDashboard";
import type { DashboardOrder, DashboardFilters as DashboardFiltersType } from "../modules/dashboard/dashboard.service";
import DashboardFilters from "../modules/dashboard/components/DashboardFilters";
import EditStatusDialog from "../components/EditStatusDialog";
import ConfirmOrderDialog from "../components/ConfirmOrderDialog";
import InvoiceDialog from "../components/InvoiceDialog";
import { updateOrderStatus } from "../modules/orders/orders.service";

// ── Style tokens ──────────────────────────────────────────────────────────────
const panel = {
  borderRadius: 0,
  boxShadow: "none",
  border: "1px solid #e1dfdd",
  bgcolor: "#ffffff",
  height: "100%",
} as const;

// ── Helpers ───────────────────────────────────────────────────────────────────
const statusColor: Record<string, string> = {
  draft:         "#605e5c",
  confirmed:     "#0078d4",
  in_production: "#f59e0b",
  delivered:     "#107c10",
  with_issue:    "#a4262c",
};

const statusLabel: Record<string, string> = {
  draft:         "Creado",
  confirmed:     "Confirmado",
  in_production: "En producción",
  delivered:     "Entregado",
  with_issue:    "Con novedad",
};

function formatCOP(value: number): string {
  return `$ ${value.toLocaleString("es-CO")}`;
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Fecha de hoy (YYYY-MM-DD) en el calendario de Bogotá, sin importar la zona horaria del navegador. */
function getBogotaTodayStr(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
}

/** El filtro por defecto es el día de hoy (Bogotá), no un rango vacío. */
function getDefaultDashboardFilters(): DashboardFiltersType {
  const today = getBogotaTodayStr();
  return { dateFrom: today, dateTo: today };
}

function formatDateLabel(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00Z`).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Descripción legible del rango de fechas activo, para usar en subtítulos ("hoy" cuando coincide con el día actual). */
function getRangeLabel(filters: DashboardFiltersType): string {
  const { dateFrom, dateTo } = filters;
  if (!dateFrom && !dateTo) return "hoy";
  const today = getBogotaTodayStr();
  if (dateFrom === today && dateTo === today) return "hoy";
  if (dateFrom && dateTo && dateFrom !== dateTo) {
    return `del ${formatDateLabel(dateFrom)} al ${formatDateLabel(dateTo)}`;
  }
  return `el ${formatDateLabel(dateFrom ?? dateTo!)}`;
}

// ── Subcomponente: Fila de pedido con desplegable ─────────────────────────────
function OrderRow({ order, onRefresh }: { order: DashboardOrder, onRefresh: () => void }) {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [editStatusOpen, setEditStatusOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const { token, user } = useAuth();
  const isAdmin = user?.role === "admin";
  const canConfirm = order.status !== "delivered" && 
                     order.status !== "with_issue";

  const handleConfirm = async () => {
    if (!token) return;
    setIsUpdating(true);
    try {
      await updateOrderStatus(order.id, "delivered", token);
      setConfirmOpen(false);
      setInvoiceOpen(true);
    } catch (err) {
      console.error("Error confirmando pedido:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditStatus = async (newStatus: string) => {
    if (!token) return;
    setIsUpdating(true);
    try {
      await updateOrderStatus(order.id, newStatus, token);
      setEditStatusOpen(false);
      onRefresh();
    } catch (err) {
      console.error("Error actualizando estado:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <TableRow
        sx={{
          "&:hover": { bgcolor: "#f0f4ff" },
          transition: "background 0.15s",
        }}
      >
        {/* Flecha desplegable */}
        <TableCell sx={{ py: 1, px: 1.5 }}>
          <IconButton
            size="small"
            sx={{ p: 0.25 }}
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? (
              <KeyboardArrowUpIcon fontSize="small" />
            ) : (
              <KeyboardArrowDownIcon fontSize="small" />
            )}
          </IconButton>
        </TableCell>

        {/* Código */}
        <TableCell
          sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#323130", cursor: "pointer" }}
          onClick={() => setOpen((prev) => !prev)}
        >
          {order.orderCode}
        </TableCell>

        {/* Cliente */}
        <TableCell
          sx={{ fontSize: "0.8rem", color: "#323130", cursor: "pointer" }}
          onClick={() => setOpen((prev) => !prev)}
        >
          {order.customerName}
        </TableCell>

        {/* Hora */}
        <TableCell
          sx={{ fontSize: "0.75rem", color: "#605e5c", cursor: "pointer" }}
          onClick={() => setOpen((prev) => !prev)}
        >
          {formatTime(order.createdAt)}
        </TableCell>

        {/* Estado */}
        <TableCell onClick={() => setOpen((prev) => !prev)} sx={{ cursor: "pointer" }}>
          <Chip
            label={statusLabel[order.status] ?? order.status}
            size="small"
            sx={{
              height: 18,
              fontSize: "0.65rem",
              fontWeight: 700,
              color: statusColor[order.status] ?? "#605e5c",
              bgcolor: `${statusColor[order.status] ?? "#605e5c"}18`,
            }}
          />
        </TableCell>

        {/* Total */}
        <TableCell
          align="right"
          sx={{ fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}
          onClick={() => setOpen((prev) => !prev)}
        >
          {formatCOP(order.total)}
        </TableCell>

        {/* Acciones */}
        <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
          <Stack direction="row" spacing={0.5} justifyContent="flex-end">

            {/* Ver factura — siempre visible */}
            <Button
              size="small"
              variant="outlined"
              onClick={() => setInvoiceOpen(true)}
              sx={{
                borderRadius: 0,
                fontSize: "0.65rem",
                py: 0.25,
                px: 1,
                borderColor: "#e1dfdd",
                color: "#605e5c",
                minWidth: "auto",
              }}
            >
              Ver factura
            </Button>

            {/* Confirmar — solo si puede confirmarse */}
            {canConfirm && (
              <Button
                size="small"
                variant="contained"
                onClick={() => setConfirmOpen(true)}
                sx={{
                  borderRadius: 0,
                  fontSize: "0.65rem",
                  py: 0.25,
                  px: 1,
                  bgcolor: "#107c10",
                  "&:hover": { bgcolor: "#0b5c0b" },
                  minWidth: "auto",
                }}
              >
                Confirmar
              </Button>
            )}

            {/* Editar estado — solo admin */}
            {isAdmin && (
              <Button
                size="small"
                variant="outlined"
                onClick={() => setEditStatusOpen(true)}
                sx={{
                  borderRadius: 0,
                  fontSize: "0.65rem",
                  py: 0.25,
                  px: 1,
                  borderColor: "#0078d4",
                  color: "#0078d4",
                  minWidth: "auto",
                }}
              >
                Estado
              </Button>
            )}

          </Stack>
        </TableCell>
      </TableRow>

      {/* Fila desplegable con detalle */}
      <TableRow>
        <TableCell colSpan={7} sx={{ py: 0, px: 0, border: 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box
              sx={{
                bgcolor: "#faf9f8",
                px: 4,
                py: 1.5,
                borderBottom: "1px solid #e1dfdd",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: "#605e5c",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  display: "block",
                  mb: 1,
                }}
              >
                Productos
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#605e5c", py: 0.5 }}>Producto</TableCell>
                    <TableCell align="center" sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#605e5c", py: 0.5 }}>Und.</TableCell>
                    <TableCell align="right" sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#605e5c", py: 0.5 }}>V. Unit.</TableCell>
                    <TableCell align="right" sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#605e5c", py: 0.5 }}>Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell sx={{ fontSize: "0.78rem", py: 0.75 }}>{item.productName}</TableCell>
                      <TableCell align="center" sx={{ fontSize: "0.78rem", py: 0.75 }}>{item.quantity}</TableCell>
                      <TableCell align="right" sx={{ fontSize: "0.78rem", py: 0.75 }}>{formatCOP(item.unitPrice)}</TableCell>
                      <TableCell align="right" sx={{ fontSize: "0.78rem", fontWeight: 600, py: 0.75 }}>{formatCOP(item.subtotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {order.notes && (
                <Typography variant="caption" sx={{ color: "#605e5c", mt: 1, display: "block" }}>
                  📝 {order.notes}
                </Typography>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>

      {/* Diálogos */}
      <ConfirmOrderDialog
        open={confirmOpen}
        order={order}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        isLoading={isUpdating}
      />

      <InvoiceDialog
        open={invoiceOpen}
        order={order}
        onClose={() => { setInvoiceOpen(false); onRefresh(); }}
      />

      <EditStatusDialog
        open={editStatusOpen}
        order={order}
        onClose={() => setEditStatusOpen(false)}
        onSave={handleEditStatus}
        isLoading={isUpdating}
      />
    </>
  );
}

// ── Subcomponente: Skeleton de KPI ────────────────────────────────────────────
function KpiSkeleton() {
  return (
    <Card sx={panel}>
      <CardContent sx={{ p: 2.5, pb: "20px !important" }}>
        <Skeleton variant="text" width="60%" height={16} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="40%" height={48} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="50%" height={14} />
      </CardContent>
    </Card>
  );
}

// ── Subcomponente: Skeleton de tabla ──────────────────────────────────────────
function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <Stack spacing={1} sx={{ p: 2 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
      ))}
    </Stack>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function DashboardPage() {
  const [filters, setFilters] = useState<DashboardFiltersType>(getDefaultDashboardFilters);
  const [appliedFilters, setAppliedFilters] = useState<DashboardFiltersType>(getDefaultDashboardFilters);
  const { summary, orders, isLoading, error, refresh } = useDashboard(appliedFilters);
  const rangeLabel = getRangeLabel(appliedFilters);

  const handleApplyFilters = () => setAppliedFilters(filters);
  const handleClearFilters = () => {
    const defaults = getDefaultDashboardFilters();
    setFilters(defaults);
    setAppliedFilters(defaults);
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", p: { xs: 1.5, md: 3 } }}>
      <Box sx={{ mb: 2 }}>
        <DashboardFilters
          value={filters}
          onChange={setFilters}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
        />
      </Box>
      <Grid container spacing={2}>

        {/* ────── FILA 1: KPIs ────── */}

        {/* KPI 1 — Pedidos entregados */}
        <Grid size={{ xs: 12, sm: 4 }}>
          {isLoading ? <KpiSkeleton /> : (
            <Card sx={{ ...panel, borderTop: "3px solid #107c10" }}>
              <CardContent sx={{ p: 2.5, pb: "20px !important" }}>
                <Typography variant="caption" sx={{ color: "#605e5c", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.08em", display: "block", mb: 1 }}>
                  Pedidos Entregados
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 300, color: "#323130", lineHeight: 1 }}>
                  {summary?.kpis.completedOrders ?? 0}
                </Typography>
                <Typography variant="caption" sx={{ color: "#605e5c", mt: 0.5, display: "block" }}>
                  Completados {rangeLabel}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* KPI 2 — Ingreso del día */}
        <Grid size={{ xs: 12, sm: 4 }}>
          {isLoading ? <KpiSkeleton /> : (
            <Card sx={{ ...panel, borderTop: "3px solid #0078d4" }}>
              <CardContent sx={{ p: 2.5, pb: "20px !important" }}>
                <Typography variant="caption" sx={{ color: "#605e5c", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.08em", display: "block", mb: 1 }}>
                  Ingreso del Día
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 300, color: "#323130", lineHeight: 1, fontSize: { xs: "1.8rem", md: "2.5rem" } }}>
                  {formatCOP(summary?.kpis.dailyRevenue ?? 0)}
                </Typography>
                <Typography variant="caption" sx={{ color: "#605e5c", mt: 0.5, display: "block" }}>
                  Pedidos completados {rangeLabel}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* KPI 3 — Devoluciones */}
        <Grid size={{ xs: 12, sm: 4 }}>
          {isLoading ? <KpiSkeleton /> : (
            <Card sx={{ ...panel, borderTop: "3px solid #a4262c" }}>
              <CardContent sx={{ p: 2.5, pb: "20px !important" }}>
                <Typography variant="caption" sx={{ color: "#605e5c", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.08em", display: "block", mb: 1 }}>
                  Devoluciones
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 300, color: "#323130", lineHeight: 1, fontSize: { xs: "1.8rem", md: "2.5rem" } }}>
                  {formatCOP(summary?.kpis.dailyReturns ?? 0)}
                </Typography>
                <Typography variant="caption" sx={{ color: "#605e5c", mt: 0.5, display: "block" }}>
                  Pérdidas registradas {rangeLabel}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* ────── FILA 2: Top clientes + Top productos ────── */}

        {/* Top 3 Clientes */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={panel}>
            <CardContent sx={{ p: 2.5, pb: "20px !important" }}>
              <Typography variant="caption" sx={{ color: "#605e5c", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", mb: 1.5 }}>
                Top 3 Clientes · {rangeLabel}
              </Typography>
              <Divider sx={{ mb: 1.5, borderColor: "#e1dfdd" }} />
              {isLoading ? (
                <TableSkeleton rows={3} />
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#faf9f8" }}>
                      <TableCell><Typography variant="caption" fontWeight={700} color="#605e5c" sx={{ textTransform: "uppercase" }}>#</Typography></TableCell>
                      <TableCell><Typography variant="caption" fontWeight={700} color="#605e5c" sx={{ textTransform: "uppercase" }}>Cliente</Typography></TableCell>
                      <TableCell align="right"><Typography variant="caption" fontWeight={700} color="#605e5c" sx={{ textTransform: "uppercase" }}>Total</Typography></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {summary?.topCustomers.map((c, i) => (
                      <TableRow key={i}>
                        <TableCell sx={{ fontSize: "0.78rem", color: "#605e5c" }}>{i + 1}</TableCell>
                        <TableCell sx={{ fontSize: "0.8rem", fontWeight: 600 }}>{c.name}</TableCell>
                        <TableCell align="right" sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#107c10" }}>{formatCOP(c.total)}</TableCell>
                      </TableRow>
                    ))}
                    {!summary?.topCustomers.length && (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ color: "#605e5c", fontSize: "0.8rem", py: 2 }}>
                          Sin pedidos completados {rangeLabel}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Top 3 Productos */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={panel}>
            <CardContent sx={{ p: 2.5, pb: "20px !important" }}>
              <Typography variant="caption" sx={{ color: "#605e5c", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", mb: 1.5 }}>
                Top 3 Productos · {rangeLabel}
              </Typography>
              <Divider sx={{ mb: 1.5, borderColor: "#e1dfdd" }} />
              {isLoading ? (
                <TableSkeleton rows={3} />
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#faf9f8" }}>
                      <TableCell><Typography variant="caption" fontWeight={700} color="#605e5c" sx={{ textTransform: "uppercase" }}>#</Typography></TableCell>
                      <TableCell><Typography variant="caption" fontWeight={700} color="#605e5c" sx={{ textTransform: "uppercase" }}>Producto</Typography></TableCell>
                      <TableCell align="right"><Typography variant="caption" fontWeight={700} color="#605e5c" sx={{ textTransform: "uppercase" }}>Ingreso</Typography></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {summary?.topProducts.map((p, i) => (
                      <TableRow key={i}>
                        <TableCell sx={{ fontSize: "0.78rem", color: "#605e5c" }}>{i + 1}</TableCell>
                        <TableCell sx={{ fontSize: "0.8rem", fontWeight: 600 }}>{p.name}</TableCell>
                        <TableCell align="right" sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#0078d4" }}>{formatCOP(p.total)}</TableCell>
                      </TableRow>
                    ))}
                    {!summary?.topProducts.length && (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ color: "#605e5c", fontSize: "0.8rem", py: 2 }}>
                          Sin ventas registradas {rangeLabel}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ────── FILA 3: Tabla pedidos del día ────── */}
        <Grid size={{ xs: 12 }}>
          <Card sx={panel}>
            <CardContent sx={{ p: 2.5, pb: "20px !important" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Typography variant="caption" sx={{ color: "#323130", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Pedidos · {rangeLabel}
                </Typography>
                <Typography variant="caption" sx={{ color: "#605e5c" }}>
                  {orders.length} pedido{orders.length !== 1 ? "s" : ""}
                </Typography>
              </Stack>
              <Divider sx={{ mb: 1.5, borderColor: "#e1dfdd" }} />
              {isLoading ? (
                <TableSkeleton rows={5} />
              ) : (
                <Box sx={{ overflowX: "auto" }}>
                  <Table size="small" sx={{ "& .MuiTableCell-root": { borderBottom: "1px solid #f3f2f1" } }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#faf9f8" }}>
                        <TableCell width={40} />
                        <TableCell><Typography variant="caption" fontWeight={700} color="#605e5c" sx={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>Código</Typography></TableCell>
                        <TableCell><Typography variant="caption" fontWeight={700} color="#605e5c" sx={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>Cliente</Typography></TableCell>
                        <TableCell><Typography variant="caption" fontWeight={700} color="#605e5c" sx={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>Hora</Typography></TableCell>
                        <TableCell><Typography variant="caption" fontWeight={700} color="#605e5c" sx={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>Estado</Typography></TableCell>
                        <TableCell align="right"><Typography variant="caption" fontWeight={700} color="#605e5c" sx={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>Total</Typography></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orders.map((order) => (
                        <OrderRow key={order.id} order={order} onRefresh={refresh}/>
                      ))}
                      {orders.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ color: "#605e5c", fontSize: "0.8rem", py: 3 }}>
                            No hay pedidos registrados {rangeLabel}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
}
