/**
 * AnalyticsPage — Analítica de la panadería.
 *
 * Todo lo que se muestra aquí proviene de /api/analytics, calculado sobre
 * pedidos entregados reales. No hay datos de ejemplo: si una sección no tiene
 * información en el rango elegido, se muestra un estado vacío explícito en vez
 * de un número inventado.
 */

import { useMemo, useState } from "react";
import {
    Box,
    Card,
    CardContent,
    Grid,
    Stack,
    Typography,
<<<<<<< HEAD
    Chip,
=======
    Divider,
    LinearProgress,
>>>>>>> 4b345116bd8deacf2a96444908ff4216e1a5d4ce
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Skeleton,
    Alert,
    ToggleButton,
    ToggleButtonGroup,
    LinearProgress,
    Tooltip,
} from "@mui/material";
import BarChartIcon from "@mui/icons-material/BarChart";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import BakeryDiningIcon from "@mui/icons-material/BakeryDining";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import {
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend,
    Cell,
    ComposedChart,
    Line,
} from "recharts";
import { useAnalytics, defaultRange, type AnalyticsRange } from "../modules/analytics/useAnalytics";
import type {
    Granularity,
    MetricDelta,
    CustomerRecency,
} from "../modules/analytics/analytics.service";

// ── Style tokens ──────────────────────────────────────────────────────────────
const panel = {
    borderRadius: 0,
    boxShadow: "none",
    border: "1px solid #e1dfdd",
    bgcolor: "#ffffff",
    height: "100%",
} as const;

const captionSx = {
    color: "#605e5c",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    display: "block",
    mb: 2,
} as const;

const ABC_COLORS: Record<"A" | "B" | "C", string> = {
    A: "#107c10",
    B: "#f59e0b",
    C: "#a19f9d",
};

const RECENCY_META: Record<CustomerRecency, { label: string; color: string }> = {
    activo: { label: "Activo", color: "#107c10" },
    en_riesgo: { label: "En riesgo", color: "#f59e0b" },
    inactivo: { label: "Inactivo", color: "#a4262c" },
    sin_compras: { label: "Sin compras", color: "#605e5c" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCOP(value: number): string {
    return `$ ${Math.round(value).toLocaleString("es-CO")}`;
}

function formatCompactCOP(value: number): string {
    if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (Math.abs(value) >= 1_000) return `${Math.round(value / 1_000)}k`;
    return String(Math.round(value));
}

function formatUnits(value: number): string {
    return value.toLocaleString("es-CO", { maximumFractionDigits: 1 });
}

/** Rango en días -> etiqueta del selector. */
const RANGE_OPTIONS = [
    { days: 7, label: "7 días" },
    { days: 30, label: "30 días" },
    { days: 90, label: "90 días" },
] as const;

// ── Subcomponentes ────────────────────────────────────────────────────────────

function KpiCard({
    label,
    metric,
    format,
    invertDelta = false,
}: {
    label: string;
    metric: MetricDelta | undefined;
    format: (n: number) => string;
    /** Para métricas donde subir es malo (p. ej. pedidos con novedad). */
    invertDelta?: boolean;
}) {
    if (!metric) {
        return (
            <Card sx={panel}>
                <CardContent sx={{ p: 2.5, pb: "20px !important" }}>
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" height={40} />
                </CardContent>
            </Card>
        );
    }

    const { changePct } = metric;
    const isGood = changePct === null ? null : invertDelta ? changePct <= 0 : changePct >= 0;
    const deltaColor = isGood === null ? "#605e5c" : isGood ? "#107c10" : "#a4262c";

    return (
        <Card sx={panel}>
            <CardContent sx={{ p: 2.5, pb: "20px !important" }}>
                <Typography
                    variant="caption"
                    sx={{
                        color: "#605e5c",
                        textTransform: "uppercase",
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                        display: "block",
                        mb: 1,
                    }}
                >
                    {label}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5, flexWrap: "wrap" }}>
                    <Typography variant="h5" sx={{ fontWeight: 300, color: "#323130", lineHeight: 1 }}>
                        {format(metric.value)}
                    </Typography>

                    {changePct === null ? (
                        <Tooltip title="Sin datos en el período anterior para comparar">
                            <Typography variant="caption" sx={{ color: "#a19f9d", fontWeight: 600 }}>
                                sin base
                            </Typography>
                        </Tooltip>
                    ) : (
                        <Stack direction="row" alignItems="center" spacing={0.25}>
                            {changePct >= 0 ? (
                                <TrendingUpIcon sx={{ fontSize: 15, color: deltaColor }} />
                            ) : (
                                <TrendingDownIcon sx={{ fontSize: 15, color: deltaColor }} />
                            )}
                            <Typography variant="body2" sx={{ color: deltaColor, fontWeight: 700 }}>
                                {changePct > 0 ? "+" : ""}
                                {changePct}%
                            </Typography>
                        </Stack>
                    )}
                </Box>

                <Typography variant="caption" sx={{ color: "#a19f9d", fontSize: "0.7rem" }}>
                    período anterior: {format(metric.previous)}
                </Typography>
            </CardContent>
        </Card>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <Box
            sx={{
                height: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#a19f9d",
            }}
        >
            <Typography variant="body2">{message}</Typography>
        </Box>
    );
}

function ChartCard({
    title,
    subtitle,
    children,
    isEmpty,
    emptyMessage,
    action,
}: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    isEmpty?: boolean;
    emptyMessage?: string;
    action?: React.ReactNode;
}) {
    return (
        <Card sx={panel}>
            <CardContent sx={{ p: 2.5, pb: "20px !important" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                    <Box>
                        <Typography variant="caption" sx={{ ...captionSx, mb: subtitle ? 0.25 : 0 }}>
                            {title}
                        </Typography>
                        {subtitle && (
                            <Typography variant="caption" sx={{ color: "#a19f9d", fontSize: "0.7rem" }}>
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                    {action}
                </Stack>

                {isEmpty ? <EmptyState message={emptyMessage ?? "Sin datos en el período"} /> : children}
            </CardContent>
        </Card>
    );
}

// ── Página ────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
    const [tabIndex, setTabIndex] = useState(0);
    const [rangeDays, setRangeDays] = useState<number>(30);
    const [granularity, setGranularity] = useState<Granularity>("day");

    const range: AnalyticsRange = useMemo(() => {
        const { from, to } = defaultRange(rangeDays);
        return { from, to, granularity };
    }, [rangeDays, granularity]);

    const {
        overview,
        timeseries,
        weekday,
        products,
        customers,
        forecast,
        isLoading,
        error,
    } = useAnalytics(range);

    // La escala del eje Y de ingresos se comparte entre gráficos por legibilidad.
    const revenueTick = (v: number) => formatCompactCOP(v);

    return (
        <Box sx={{ bgcolor: "background.default", minHeight: "100vh", p: { xs: 1.5, md: 3 } }}>

            {/* ── Cabecera: rango + granularidad ── */}
            <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", md: "center" }}
                spacing={1.5}
                sx={{ mb: 2 }}
            >
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: "#323130" }}>
                        Analítica
                    </Typography>
                    {overview && (
                        <Typography variant="caption" sx={{ color: "#605e5c" }}>
                            {overview.period.from} → {overview.period.to} · comparado con{" "}
                            {overview.period.previousFrom} → {overview.period.previousTo}
                        </Typography>
                    )}
                </Box>

                <ToggleButtonGroup
                    size="small"
                    exclusive
                    value={rangeDays}
                    onChange={(_, v: number | null) => v !== null && setRangeDays(v)}
                    sx={{
                        "& .MuiToggleButton-root": {
                            textTransform: "none",
                            borderRadius: 0,
                            px: 1.75,
                            py: 0.4,
                            fontSize: "0.78rem",
                            borderColor: "#e1dfdd",
                            color: "#605e5c",
                            "&.Mui-selected": {
                                bgcolor: "#6B3A2A",
                                color: "#fff",
                                "&:hover": { bgcolor: "#4A271C" },
                            },
                        },
                    }}
                >
                    {RANGE_OPTIONS.map((o) => (
                        <ToggleButton key={o.days} value={o.days}>
                            {o.label}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </Stack>

            {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }}>
                    {error}
                </Alert>
            )}

            {isLoading && <LinearProgress sx={{ mb: 2, height: 2 }} />}

            {/* ── Tabs ── */}
            <Tabs
                value={tabIndex}
                onChange={(_, v: number) => setTabIndex(v)}
                TabIndicatorProps={{ sx: { height: 3, borderRadius: 0, bgcolor: "#6B3A2A" } }}
                sx={{
                    mb: 2.5,
                    minHeight: 36,
                    borderBottom: "1px solid #e1dfdd",
                    "& .MuiTab-root": {
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        color: "#605e5c",
                        minHeight: 36,
                        py: 0.5,
                        px: 2.5,
                        "&.Mui-selected": { color: "#6B3A2A", fontWeight: 700 },
                    },
                }}
            >
                <Tab icon={<BarChartIcon sx={{ fontSize: 18, mr: 0.5 }} />} iconPosition="start" label="Ventas" />
                <Tab icon={<BakeryDiningIcon sx={{ fontSize: 18, mr: 0.5 }} />} iconPosition="start" label="Productos y Producción" />
                <Tab icon={<PeopleAltIcon sx={{ fontSize: 18, mr: 0.5 }} />} iconPosition="start" label="Clientes" />
            </Tabs>

            {/* ══════════════ TAB 0 · VENTAS ══════════════ */}
            {tabIndex === 0 && (
                <Grid container spacing={2}>

                    {/* KPIs */}
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <KpiCard label="Ingresos (COP)" metric={overview?.revenue} format={formatCOP} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <KpiCard
                            label="Pedidos entregados"
                            metric={overview?.deliveredOrders}
                            format={(n) => n.toLocaleString("es-CO")}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <KpiCard label="Ticket promedio" metric={overview?.averageTicket} format={formatCOP} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <KpiCard
                            label="Unidades vendidas"
                            metric={overview?.unitsSold}
                            format={(n) => formatUnits(n)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <KpiCard
                            label="Clientes activos"
                            metric={overview?.activeCustomers}
                            format={(n) => n.toLocaleString("es-CO")}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <KpiCard
                            label="Tasa de cumplimiento"
                            metric={overview?.fulfillmentRate}
                            format={(n) => `${n.toFixed(1)} %`}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <KpiCard
                            label="Pedidos con novedad"
                            metric={overview?.issueOrders}
                            format={(n) => n.toLocaleString("es-CO")}
                            invertDelta
                        />
                    </Grid>

                    {/* Serie temporal */}
                    <Grid size={{ xs: 12 }}>
                        <ChartCard
                            title="Ingresos y pedidos en el tiempo"
                            subtitle="Solo pedidos entregados, agrupados por fecha de entrega"
                            isEmpty={!isLoading && (timeseries?.points.length ?? 0) === 0}
                            action={
                                <ToggleButtonGroup
                                    size="small"
                                    exclusive
                                    value={granularity}
                                    onChange={(_, v: Granularity | null) => v && setGranularity(v)}
                                    sx={{
                                        "& .MuiToggleButton-root": {
                                            textTransform: "none",
                                            borderRadius: 0,
                                            px: 1.25,
                                            py: 0.2,
                                            fontSize: "0.72rem",
                                            borderColor: "#e1dfdd",
                                            color: "#605e5c",
                                            "&.Mui-selected": { bgcolor: "#6B3A2A", color: "#fff" },
                                        },
                                    }}
                                >
                                    <ToggleButton value="day">Día</ToggleButton>
                                    <ToggleButton value="week">Semana</ToggleButton>
                                    <ToggleButton value="month">Mes</ToggleButton>
                                </ToggleButtonGroup>
                            }
                        >
                            <Box sx={{ height: 290 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={timeseries?.points ?? []} margin={{ top: 5, right: 15, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6B3A2A" stopOpacity={0.55} />
                                                <stop offset="95%" stopColor="#6B3A2A" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1dfdd" />
                                        <XAxis
                                            dataKey="label"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 11, fill: "#605e5c" }}
                                            dy={8}
                                            interval="preserveStartEnd"
                                            minTickGap={20}
                                        />
                                        <YAxis
                                            yAxisId="rev"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 11, fill: "#605e5c" }}
                                            tickFormatter={revenueTick}
                                        />
                                        <YAxis
                                            yAxisId="ord"
                                            orientation="right"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 11, fill: "#a67c52" }}
                                            allowDecimals={false}
                                        />
                                        <RechartsTooltip
                                            formatter={(value: unknown, name: unknown) =>
                                                name === "Ingresos"
                                                    ? [formatCOP(Number(value)), "Ingresos"]
                                                    : [Number(value).toLocaleString("es-CO"), String(name)]
                                            }
                                        />
                                        <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: "#605e5c", paddingTop: 8 }} />
                                        <Area
                                            yAxisId="rev"
                                            type="monotone"
                                            name="Ingresos"
                                            dataKey="revenue"
                                            stroke="#6B3A2A"
                                            strokeWidth={2}
                                            fill="url(#gRev)"
                                        />
                                        <Line
                                            yAxisId="ord"
                                            type="monotone"
                                            name="Pedidos"
                                            dataKey="orders"
                                            stroke="#A67C52"
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </Box>
                        </ChartCard>
                    </Grid>

                    {/* Estacionalidad semanal */}
                    <Grid size={{ xs: 12, md: 7 }}>
                        <ChartCard
                            title="Estacionalidad por día de semana"
                            subtitle="Promedio de ingresos por jornada; incluye los días sin despacho"
                            isEmpty={!isLoading && (weekday?.points.length ?? 0) === 0}
                        >
                            <Box sx={{ height: 250 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={weekday?.points ?? []} margin={{ top: 5, right: 15, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1dfdd" />
                                        <XAxis
                                            dataKey="label"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 11, fill: "#605e5c" }}
                                            tickFormatter={(v: string) => v.slice(0, 3)}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 11, fill: "#605e5c" }}
                                            tickFormatter={revenueTick}
                                        />
                                        <RechartsTooltip
                                            formatter={(v: unknown) => [formatCOP(Number(v)), "Promedio por jornada"]}
                                            labelFormatter={(label: unknown) => {
                                                const p = weekday?.points.find((x) => x.label === label);
                                                return p
                                                    ? `${label} · ${p.occurrences} jornadas · ${p.sharePct}% de los ingresos`
                                                    : String(label);
                                            }}
                                        />
                                        <Bar dataKey="averageRevenue" name="Promedio por jornada" barSize={26}>
                                            {(weekday?.points ?? []).map((p) => (
                                                <Cell
                                                    key={p.weekday}
                                                    fill={p.revenue === 0 ? "#e1dfdd" : "#6B3A2A"}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        </ChartCard>
                    </Grid>

                    {/* Detalle de estacionalidad */}
                    <Grid size={{ xs: 12, md: 5 }}>
                        <ChartCard
                            title="Detalle por jornada"
                            isEmpty={!isLoading && (weekday?.points.length ?? 0) === 0}
                        >
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700, fontSize: "0.72rem" }}>Día</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.72rem" }}>Ingresos</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.72rem" }}>Pedidos</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.72rem" }}>Part.</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(weekday?.points ?? []).map((p) => (
                                        <TableRow key={p.weekday} sx={{ opacity: p.revenue === 0 ? 0.5 : 1 }}>
                                            <TableCell sx={{ fontSize: "0.78rem" }}>{p.label}</TableCell>
                                            <TableCell align="right" sx={{ fontSize: "0.78rem" }}>
                                                {formatCOP(p.revenue)}
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontSize: "0.78rem" }}>{p.orders}</TableCell>
                                            <TableCell align="right" sx={{ fontSize: "0.78rem", fontWeight: 600 }}>
                                                {p.sharePct}%
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ChartCard>
                    </Grid>
                </Grid>
            )}

            {/* ══════════════ TAB 1 · PRODUCTOS Y PRODUCCIÓN ══════════════ */}
            {tabIndex === 1 && (
                <Grid container spacing={2}>

                    {/* Ranking de productos */}
                    <Grid size={{ xs: 12, md: 7 }}>
                        <ChartCard
                            title="Ingresos por producto"
                            subtitle={
                                products
                                    ? `${products.rows.length} productos con venta · total ${formatCOP(products.totalRevenue)}`
                                    : undefined
                            }
                            isEmpty={!isLoading && (products?.rows.length ?? 0) === 0}
                        >
                            <Box sx={{ height: Math.max(260, (products?.rows.length ?? 0) * 26) }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={products?.rows ?? []}
                                        layout="vertical"
                                        margin={{ top: 5, right: 20, left: 0, bottom: 0 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e1dfdd" />
                                        <XAxis
                                            type="number"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 11, fill: "#605e5c" }}
                                            tickFormatter={revenueTick}
                                        />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fill: "#323130" }}
                                            width={160}
                                        />
                                        <RechartsTooltip
                                            formatter={(v: unknown) => [formatCOP(Number(v)), "Ingresos"]}
                                            labelFormatter={(label: unknown) => {
                                                const r = products?.rows.find((x) => x.name === label);
                                                return r
                                                    ? `${label} · clase ${r.abcClass} · ${formatUnits(r.units)} uds`
                                                    : String(label);
                                            }}
                                        />
                                        <Bar dataKey="revenue" name="Ingresos" barSize={14}>
                                            {(products?.rows ?? []).map((r) => (
                                                <Cell key={r.productId} fill={ABC_COLORS[r.abcClass]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>

                            <Stack direction="row" spacing={1.5} sx={{ mt: 1.5, flexWrap: "wrap" }}>
                                {(["A", "B", "C"] as const).map((c) => (
                                    <Stack key={c} direction="row" spacing={0.5} alignItems="center">
                                        <Box sx={{ width: 10, height: 10, bgcolor: ABC_COLORS[c] }} />
                                        <Typography variant="caption" sx={{ color: "#605e5c", fontSize: "0.7rem" }}>
                                            Clase {c}
                                            {c === "A" ? " (hasta 80% acum.)" : c === "B" ? " (80–95%)" : " (resto)"}
                                        </Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        </ChartCard>
                    </Grid>

                    {/* Tabla ABC */}
                    <Grid size={{ xs: 12, md: 5 }}>
                        <ChartCard
                            title="Análisis ABC (Pareto)"
                            subtitle="Qué referencias concentran los ingresos"
                            isEmpty={!isLoading && (products?.rows.length ?? 0) === 0}
                        >
                            <Box sx={{ maxHeight: 420, overflowY: "auto" }}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700, fontSize: "0.72rem" }}>Producto</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.72rem" }}>Uds</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.72rem" }}>Part.</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.72rem" }}>Acum.</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {(products?.rows ?? []).map((r) => (
                                            <TableRow key={r.productId}>
                                                <TableCell sx={{ fontSize: "0.75rem" }}>
                                                    <Stack direction="row" spacing={0.75} alignItems="center">
                                                        <Box sx={{ width: 6, height: 6, bgcolor: ABC_COLORS[r.abcClass], flexShrink: 0 }} />
                                                        <span>{r.name}</span>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontSize: "0.75rem" }}>
                                                    {formatUnits(r.units)}
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontSize: "0.75rem" }}>{r.sharePct}%</TableCell>
                                                <TableCell align="right" sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                                                    {r.cumulativeSharePct}%
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>
                        </ChartCard>
                    </Grid>

                    {/* Pronóstico de demanda */}
                    <Grid size={{ xs: 12 }}>
                        <ChartCard
                            title="Plan de producción sugerido · próximos 7 días"
                            subtitle={
                                forecast
                                    ? `Unidades proyectadas por promedio del mismo día de semana · base ${forecast.lookbackWeeks} semanas (${forecast.lookbackFrom} → ${forecast.lookbackTo})`
                                    : undefined
                            }
                            isEmpty={!isLoading && (forecast?.rows.length ?? 0) === 0}
                            emptyMessage="Sin historial suficiente para proyectar demanda"
                        >
                            <Box sx={{ overflowX: "auto" }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700, fontSize: "0.72rem", minWidth: 180 }}>
                                                Producto
                                            </TableCell>
                                            {(forecast?.generatedFor ?? []).map((d) => (
                                                <TableCell
                                                    key={d.date}
                                                    align="right"
                                                    sx={{ fontWeight: 700, fontSize: "0.72rem", whiteSpace: "nowrap" }}
                                                >
                                                    {d.label.slice(0, 3)}
                                                    <Typography
                                                        component="span"
                                                        sx={{ display: "block", fontWeight: 400, color: "#a19f9d", fontSize: "0.65rem" }}
                                                    >
                                                        {d.date.slice(5)}
                                                    </Typography>
                                                </TableCell>
                                            ))}
                                            <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.72rem" }}>
                                                Total
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {(forecast?.rows ?? []).map((r) => (
                                            <TableRow key={r.productId}>
                                                <TableCell sx={{ fontSize: "0.75rem" }}>{r.name}</TableCell>
                                                {r.byDate.map((d) => (
                                                    <TableCell
                                                        key={d.date}
                                                        align="right"
                                                        sx={{
                                                            fontSize: "0.75rem",
                                                            color: d.units === 0 ? "#c8c6c4" : "#323130",
                                                        }}
                                                    >
                                                        {d.units === 0 ? "—" : formatUnits(d.units)}
                                                    </TableCell>
                                                ))}
                                                <TableCell align="right" sx={{ fontSize: "0.75rem", fontWeight: 700 }}>
                                                    {formatUnits(r.totalUnits)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {forecast && forecast.rows.length > 0 && (
                                            <TableRow sx={{ bgcolor: "#faf9f8" }}>
                                                <TableCell sx={{ fontSize: "0.75rem", fontWeight: 700 }}>
                                                    Total unidades
                                                </TableCell>
                                                {forecast.generatedFor.map((d, i) => (
                                                    <TableCell key={d.date} align="right" sx={{ fontSize: "0.75rem", fontWeight: 700 }}>
                                                        {formatUnits(
                                                            forecast.rows.reduce((a, r) => a + (r.byDate[i]?.units ?? 0), 0),
                                                        )}
                                                    </TableCell>
                                                ))}
                                                <TableCell align="right" sx={{ fontSize: "0.75rem", fontWeight: 700 }}>
                                                    {formatUnits(forecast.totalUnits)}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </Box>
                        </ChartCard>
                    </Grid>
                </Grid>
            )}

            {/* ══════════════ TAB 2 · CLIENTES ══════════════ */}
            {tabIndex === 2 && (
                <Grid container spacing={2}>

                    {/* Concentración */}
                    <Grid size={{ xs: 12, md: 7 }}>
                        <ChartCard
                            title="Ingresos por cliente"
                            subtitle={
                                customers
                                    ? `${customers.rows.filter((r) => r.orders > 0).length} clientes con compras en el período`
                                    : undefined
                            }
                            isEmpty={!isLoading && (customers?.rows.length ?? 0) === 0}
                        >
                            <Box sx={{ height: Math.max(260, (customers?.rows.length ?? 0) * 30) }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={customers?.rows ?? []}
                                        layout="vertical"
                                        margin={{ top: 5, right: 20, left: 0, bottom: 0 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e1dfdd" />
                                        <XAxis
                                            type="number"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 11, fill: "#605e5c" }}
                                            tickFormatter={revenueTick}
                                        />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fill: "#323130" }}
                                            width={150}
                                        />
                                        <RechartsTooltip
                                            formatter={(v: unknown) => [formatCOP(Number(v)), "Ingresos"]}
                                            labelFormatter={(label: unknown) => {
                                                const r = customers?.rows.find((x) => x.name === label);
                                                return r ? `${label} · ${r.orders} pedidos · ${r.sharePct}%` : String(label);
                                            }}
                                        />
                                        <Bar dataKey="revenue" name="Ingresos" barSize={16}>
                                            {(customers?.rows ?? []).map((r) => (
                                                <Cell key={r.customerId} fill={RECENCY_META[r.recency].color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        </ChartCard>
                    </Grid>

                    {/* Tabla de clientes */}
                    <Grid size={{ xs: 12, md: 5 }}>
                        <ChartCard
                            title="Cartera y recencia"
                            subtitle="Activo ≤14 días · En riesgo 15–30 · Inactivo >30"
                            isEmpty={!isLoading && (customers?.rows.length ?? 0) === 0}
                        >
                            <Box sx={{ maxHeight: 440, overflowY: "auto" }}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700, fontSize: "0.72rem" }}>Cliente</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.72rem" }}>Ticket</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.72rem" }}>Últ.</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: "0.72rem" }}>Estado</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {(customers?.rows ?? []).map((r) => (
                                            <TableRow key={r.customerId}>
                                                <TableCell sx={{ fontSize: "0.75rem" }}>
                                                    {r.name}
                                                    <Typography
                                                        component="span"
                                                        sx={{ display: "block", color: "#a19f9d", fontSize: "0.65rem" }}
                                                    >
                                                        {r.orders} pedidos · {r.sharePct}%
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontSize: "0.75rem" }}>
                                                    {r.orders === 0 ? "—" : formatCOP(r.averageTicket)}
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                                                    {r.daysSinceLastPurchase === null
                                                        ? "—"
                                                        : `${r.daysSinceLastPurchase}d`}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        size="small"
                                                        label={RECENCY_META[r.recency].label}
                                                        sx={{
                                                            borderRadius: 0,
                                                            height: 20,
                                                            fontSize: "0.65rem",
                                                            fontWeight: 600,
                                                            color: RECENCY_META[r.recency].color,
                                                            bgcolor: `${RECENCY_META[r.recency].color}14`,
                                                        }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>
                        </ChartCard>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
}
