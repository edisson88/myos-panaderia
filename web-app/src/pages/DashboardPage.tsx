import { useState } from "react";
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
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    LinearProgress,
    Tooltip,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import OrderDetailDialog, { type OrderDetail } from "../components/OrderDetailDialog";
import { useNavigate } from "react-router-dom";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
} from "recharts";

import ClientMapCard from "../components/ClientMapCard";

// ── Mock Data ────────────────────────────────────────────────────────────────
const hourlyData = [
    { hora: "6am", ventas: 120000, pedidos: 3 },
    { hora: "7am", ventas: 380000, pedidos: 9 },
    { hora: "8am", ventas: 620000, pedidos: 15 },
    { hora: "9am", ventas: 510000, pedidos: 12 },
    { hora: "10am", ventas: 290000, pedidos: 7 },
    { hora: "11am", ventas: 340000, pedidos: 8 },
    { hora: "12pm", ventas: 480000, pedidos: 11 },
    { hora: "1pm", ventas: 560000, pedidos: 13 },
    { hora: "2pm", ventas: 410000, pedidos: 10 },
    { hora: "3pm", ventas: 270000, pedidos: 6 },
    { hora: "4pm", ventas: 190000, pedidos: 4 },
    { hora: "5pm", ventas: 130000, pedidos: 3 },
];

const weeklyRevenue = [
    { name: "Lun", ventas: 1200000, meta: 1000000 },
    { name: "Mar", ventas: 1400000, meta: 1000000 },
    { name: "Mié", ventas: 1100000, meta: 1000000 },
    { name: "Jue", ventas: 1600000, meta: 1200000 },
    { name: "Vie", ventas: 2100000, meta: 1800000 },
    { name: "Sáb", ventas: 2800000, meta: 2500000 },
    { name: "Dom", ventas: 3000000, meta: 2500000 },
];

const categoryData = [
    { category: "Pan Salado", cantidad: 450, desperdicio: 20 },
    { category: "Pan Dulce", cantidad: 380, desperdicio: 15 },
    { category: "Postres", cantidad: 200, desperdicio: 5 },
    { category: "Bebidas", cantidad: 150, desperdicio: 2 },
];

const pieData = [
    { name: "Pan Salado", value: 38 },
    { name: "Pan Dulce", value: 32 },
    { name: "Postres", value: 18 },
    { name: "Bebidas", value: 12 },
];
const PIE_COLORS = ["#118dff", "#00b894", "#f59e0b", "#a78bfa"];

const recentOrders: OrderDetail[] = [
    {
        id: "PED-2025-001",
        date: "Hoy 14:32 · 25 marzo 2025",
        customer: "María Cárdenas",
        address: "Cra 15 # 82-43, Chapinero, Bogotá",
        phone: "+57 310 234 5678",
        status: "Confirmado",
        deliveryMethod: "Domicilio",
        operator: "Carlos Gómez",
        items: [
            { description: "Baguette Clásica x6", qty: 2, unitPrice: 18000, subtotal: 36000 },
            { description: "Croissant Mantequilla", qty: 4, unitPrice: 5500, subtotal: 22000 },
            { description: "Pan de Bono x12", qty: 1, unitPrice: 24000, subtotal: 24000 },
        ],
        subtotal: 82000,
        tax: 15580,
        total: 97580,
        notes: "Entregar antes de las 3:00 PM. Apartamento 401.",
    },
    {
        id: "PED-2025-002",
        date: "Hoy 13:15 · 25 marzo 2025",
        customer: "Café Niza",
        address: "Calle 72 # 10-34, Bogotá",
        phone: "+57 1 234 5678",
        status: "Entregado",
        deliveryMethod: "Recogida en tienda",
        operator: "Ana Torres",
        items: [
            { description: "Pan Campesino 500g", qty: 10, unitPrice: 9500, subtotal: 95000 },
            { description: "Mogollas x12", qty: 5, unitPrice: 14000, subtotal: 70000 },
            { description: "Rolls de Canela x6", qty: 3, unitPrice: 21000, subtotal: 63000 },
        ],
        subtotal: 228000,
        tax: 17000,
        total: 245000,
        notes: "Cliente frecuente. Factura a nombre de Café Niza SAS.",
    },
    {
        id: "PED-2025-003",
        date: "Hoy 11:40 · 25 marzo 2025",
        customer: "Juan Rojas",
        address: "Calle 45 # 7-21, Teusaquillo, Bogotá",
        phone: "+57 320 456 7890",
        status: "Entregado",
        deliveryMethod: "Domicilio",
        operator: "Carlos Gómez",
        items: [
            { description: "Torta de Chocolate", qty: 1, unitPrice: 35000, subtotal: 35000 },
            { description: "Muffins de Arándano x4", qty: 1, unitPrice: 16000, subtotal: 16000 },
        ],
        subtotal: 51000,
        tax: 0,
        total: 51000,
    },
    {
        id: "PED-2025-004",
        date: "Ayer 16:00 · 24 marzo 2025",
        customer: "Restaurante El Patio",
        address: "Av. 19 # 100-55, Bogotá",
        phone: "+57 1 987 6543",
        status: "Completado",
        deliveryMethod: "Domicilio programado",
        operator: "Luis Mora",
        items: [
            { description: "Pan Artesanal x20", qty: 2, unitPrice: 85000, subtotal: 170000 },
            { description: "Baguette Francesa x10", qty: 3, unitPrice: 42000, subtotal: 126000 },
            { description: "Focaccia Romero", qty: 5, unitPrice: 28000, subtotal: 140000 },
            { description: "Ciabatta", qty: 4, unitPrice: 22000, subtotal: 88000 },
        ],
        subtotal: 524000,
        tax: 6000,
        total: 530000,
        notes: "Pedido semanal. Requiere factura electrónica.",
    },
];

const productionBatches = [
    { name: "Baguette Clásica", progreso: 100, listo: true },
    { name: "Pan de Bono", progreso: 75, listo: false },
    { name: "Croissant Mantequilla", progreso: 45, listo: false },
    { name: "Torta de Naranja", progreso: 20, listo: false },
];

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
    Confirmado: "#0078d4",
    Entregado: "#107c10",
    Completado: "#605e5c",
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
    const today = new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
    const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
    const navigate = useNavigate();

    const handleDrillDown = (data: any) => {
        if (data && data.category) {
            // Navegar a producción filtrando por la categoría
            navigate(`/produccion?search=${encodeURIComponent(data.category)}`);
        }
    };

    return (
        <Box sx={{ bgcolor: "background.default", minHeight: "100vh", p: { xs: 1.5, md: 3 } }}>

            <Grid container spacing={2}>

                {/* ────── FILA 1: KPIs del día ────── */}

                {/* KPI 1 – Entregas */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={panel}>
                        <CardContent sx={{ p: 2.5, pb: "20px !important" }}>
                            <Typography variant="caption" sx={{ color: "#605e5c", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.08em", display: "block", mb: 1 }}>
                                Entregas Hoy
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5 }}>
                                <Typography variant="h3" sx={{ fontWeight: 300, color: "#323130", lineHeight: 1 }}>24</Typography>
                                <Typography variant="body2" sx={{ color: "#107c10", fontWeight: 700 }}>+5.2 %</Typography>
                            </Box>
                            <Typography variant="caption" sx={{ color: "#605e5c", mt: 0.5, display: "block" }}>vs ayer: 22</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* KPI 2 – Ingresos del día */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{ ...panel, borderTop: "3px solid #0078d4" }}>
                        <CardContent sx={{ p: 2.5, pb: "20px !important" }}>
                            <Typography variant="caption" sx={{ color: "#605e5c", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.08em", display: "block", mb: 1 }}>
                                Ingresos Hoy (COP)
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                                <Typography variant="h3" sx={{ fontWeight: 300, color: "#323130", lineHeight: 1 }}>4.3 M</Typography>
                                <Typography variant="body2" sx={{ color: "#107c10", fontWeight: 700 }}>+8.1 %</Typography>
                            </Box>
                            <Typography variant="caption" sx={{ color: "#605e5c", mt: 0.5, display: "block" }}>Meta: $ 4.0 M</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* KPI 3 – Lotes en producción */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={panel}>
                        <CardContent sx={{ p: 2.5, pb: "20px !important" }}>
                            <Typography variant="caption" sx={{ color: "#605e5c", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.08em", display: "block", mb: 1 }}>
                                Lotes en Producción
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5 }}>
                                <Typography variant="h3" sx={{ fontWeight: 300, color: "#323130", lineHeight: 1 }}>8</Typography>
                                <Typography variant="body2" sx={{ color: "#a4262c", fontWeight: 700 }}>Retraso: 1</Typography>
                            </Box>
                            <Typography variant="caption" sx={{ color: "#605e5c", mt: 0.5, display: "block" }}>4 completados, 3 en curso</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* KPI 4 – Satisfacción */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={panel}>
                        <CardContent sx={{ p: 2.5, pb: "20px !important" }}>
                            <Typography variant="caption" sx={{ color: "#605e5c", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.08em", display: "block", mb: 1 }}>
                                Satisfacción Cliente
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                                <Typography variant="h3" sx={{ fontWeight: 300, color: "#323130", lineHeight: 1 }}>98 %</Typography>
                            </Box>
                            <Typography variant="caption" sx={{ color: "#107c10", mt: 0.5, display: "block", fontWeight: 600 }}>↑ 0.5 pp esta semana</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* ────── FILA 2: Gráfica horaria del día (cuadro 1 grande) ────── */}
                <Grid size={{ xs: 12 }}>
                    <Card sx={panel}>
                        <CardContent sx={{ p: 2.5, pb: "20px !important" }}>
                            <Typography variant="caption" sx={{ color: "#605e5c", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", mb: 2 }}>
                                Actividad comercial por hora · Hoy
                            </Typography>
                            <Box sx={{ height: 220 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={hourlyData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="gHourly" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#118dff" stopOpacity={0.65} />
                                                <stop offset="95%" stopColor="#118dff" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1dfdd" />
                                        <XAxis dataKey="hora" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#605e5c" }} dy={8} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#605e5c" }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                                        <RechartsTooltip
                                            formatter={(v: unknown, name) => [
                                                name === "ventas" ? `$ ${Number(v).toLocaleString("es-CO")}` : `${String(v)} pedidos`,
                                                name === "ventas" ? "Ingresos" : "Pedidos",
                                            ]}
                                        />
                                        <Area type="monotone" name="ventas" dataKey="ventas" stroke="#118dff" strokeWidth={2} fillOpacity={1} fill="url(#gHourly)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* ────── FILA 3: Ventas semana + Producción ────── */}

                {/* Cuadro 2 – Ventas vs Meta semana */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Card sx={panel}>
                        <CardContent sx={{ p: 2.5, pb: "20px !important" }}>
                            <Typography variant="caption" sx={{ color: "#605e5c", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", mb: 2 }}>
                                Tendencia de Ingresos vs Meta · Últimos 7 días
                            </Typography>
                            <Box sx={{ height: 240 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={weeklyRevenue} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="gVentas" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#118dff" stopOpacity={0.7} />
                                                <stop offset="95%" stopColor="#118dff" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="gMeta" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#00b894" stopOpacity={0.35} />
                                                <stop offset="95%" stopColor="#00b894" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1dfdd" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#605e5c" }} dy={8} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#605e5c" }} tickFormatter={(v: number) => `${(v / 1000000).toFixed(1)}M`} />
                                        <RechartsTooltip formatter={(v: unknown) => [`$ ${Number(v).toLocaleString("es-CO")}`, ""]} />
                                        <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: "#605e5c", paddingTop: 8 }} />
                                        <Area type="monotone" name="Meta" dataKey="meta" stroke="#00b894" strokeWidth={2} fillOpacity={1} fill="url(#gMeta)" />
                                        <Area type="monotone" name="Ventas" dataKey="ventas" stroke="#118dff" strokeWidth={2} fillOpacity={1} fill="url(#gVentas)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Cuadro 3 – Pedidos recientes */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={panel}>
                        <CardContent sx={{ p: 2.5, pb: "20px !important" }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                                <Typography variant="caption" sx={{ color: "#323130", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                    Pedidos Recientes
                                </Typography>
                                <Typography variant="caption" sx={{ color: "#0078d4", cursor: "pointer", fontWeight: 600 }}>
                                    Ver todo →
                                </Typography>
                            </Stack>
                            <Divider sx={{ mb: 1.5, borderColor: "#e1dfdd" }} />
                            <Box sx={{ overflowX: "auto" }}>
                                <Table size="small" sx={{ "& .MuiTableCell-root": { borderBottom: "1px solid #f3f2f1", py: 1.2, px: 1, fontSize: "0.8rem", color: "#323130" } }}>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: "#faf9f8" }}>
                                            <TableCell><Typography variant="caption" fontWeight={700} color="#605e5c" sx={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>Hora</Typography></TableCell>
                                            <TableCell><Typography variant="caption" fontWeight={700} color="#605e5c" sx={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>Cliente</Typography></TableCell>
                                            <TableCell align="right"><Typography variant="caption" fontWeight={700} color="#605e5c" sx={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>Total</Typography></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {recentOrders.map((order, idx) => (
                                            <Tooltip key={idx} title="Ver detalle y exportar PDF" placement="left" arrow>
                                                <TableRow
                                                    onClick={() => setSelectedOrder(order)}
                                                    sx={{
                                                        cursor: "pointer",
                                                        transition: "background 0.15s",
                                                        "&:hover": {
                                                            bgcolor: "#f0f4ff",
                                                            "& .row-action-icon": { opacity: 1 },
                                                        },
                                                    }}
                                                >
                                                    <TableCell sx={{ color: "#605e5c", whiteSpace: "nowrap", fontSize: "0.75rem" }}>
                                                        {order.date.split(" · ")[0]}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box>
                                                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                                                <Typography variant="caption" sx={{ fontWeight: 600 }}>{order.customer}</Typography>
                                                                <OpenInNewIcon className="row-action-icon" sx={{ fontSize: 11, color: "#0078d4", opacity: 0, transition: "opacity 0.15s" }} />
                                                            </Stack>
                                                            <Chip
                                                                label={order.status}
                                                                size="small"
                                                                sx={{ height: 16, fontSize: "0.6rem", fontWeight: 700, color: statusColor[order.status] ?? "#605e5c", bgcolor: `${statusColor[order.status] ?? "#605e5c"}15` }}
                                                            />
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                                                        $ {order.total.toLocaleString("es-CO")}
                                                    </TableCell>
                                                </TableRow>
                                            </Tooltip>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* ────── FILA 4: Mix ventas + Lotes de producción + Pedidos recientes ────── */}

                {/* Cuadro 4 – Mix de ventas (Pie) */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={panel}>
                        <CardContent sx={{ p: 2.5, pb: "20px !important" }}>
                            <Typography variant="caption" sx={{ color: "#605e5c", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", mb: 2 }}>
                                Mix de Ventas por Categoría · Hoy
                            </Typography>
                            <Box sx={{ height: 220 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                                            {pieData.map((_, index) => (
                                                <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip formatter={(v: unknown, name) => [`${String(v)}%`, String(name ?? "")]} />
                                        <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Cuadro 5 – Estado de lotes de producción */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={panel}>
                        <CardContent sx={{ p: 2.5, pb: "20px !important" }}>
                            <Typography variant="caption" sx={{ color: "#605e5c", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", mb: 2 }}>
                                Estado de Producción · Lotes activos
                            </Typography>
                            <Stack spacing={2}>
                                {productionBatches.map((batch, i) => (
                                    <Box key={i}>
                                        <Stack direction="row" justifyContent="space-between" mb={0.5}>
                                            <Typography variant="caption" sx={{ fontWeight: 600, color: "#323130" }}>{batch.name}</Typography>
                                            <Chip
                                                label={batch.listo ? "Listo ✓" : `${batch.progreso}%`}
                                                size="small"
                                                sx={{
                                                    height: 18, fontSize: "0.65rem", fontWeight: 700,
                                                    bgcolor: batch.listo ? "#107c1015" : "#0078d415",
                                                    color: batch.listo ? "#107c10" : "#0078d4",
                                                }}
                                            />
                                        </Stack>
                                        <LinearProgress
                                            variant="determinate"
                                            value={batch.progreso}
                                            sx={{
                                                height: 5,
                                                borderRadius: 3,
                                                bgcolor: "#f3f2f1",
                                                "& .MuiLinearProgress-bar": {
                                                    bgcolor: batch.listo ? "#107c10" : "#0078d4",
                                                    borderRadius: 3,
                                                },
                                            }}
                                        />
                                    </Box>
                                ))}
                            </Stack>

                            <Divider sx={{ my: 2, borderColor: "#e1dfdd" }} />

                            {/* Mini line chart pedidos por hora */}
                            <Typography variant="caption" sx={{ color: "#605e5c", fontWeight: 600, display: "block", mb: 1 }}>
                                Pedidos / hora hoy
                            </Typography>
                            <Box sx={{ height: 70 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={hourlyData} margin={{ top: 2, right: 5, left: -30, bottom: 0 }}>
                                        <YAxis hide />
                                        <XAxis dataKey="hora" tick={{ fontSize: 9, fill: "#605e5c" }} axisLine={false} tickLine={false} />
                                        <RechartsTooltip formatter={(v: unknown) => [`${v}`, "Pedidos"]} />
                                        <Line type="monotone" dataKey="pedidos" stroke="#f59e0b" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Cuadro 5b – Producción vs Desperdicio */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={panel}>
                        <CardContent sx={{ p: 2.5, pb: "20px !important" }}>
                            <Typography variant="caption" sx={{ color: "#605e5c", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", mb: 2 }}>
                                Producción vs Desperdicio
                            </Typography>
                            <Box sx={{ height: 240 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e1dfdd" />
                                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#605e5c" }} />
                                        <YAxis dataKey="category" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#323130" }} width={78} />
                                        <RechartsTooltip />
                                        <Legend iconType="square" wrapperStyle={{ fontSize: 12 }} />
                                        <Bar 
                                            dataKey="cantidad" 
                                            name="Producido" 
                                            stackId="a" 
                                            fill="#118dff" 
                                            barSize={14} 
                                            style={{ cursor: 'pointer' }}
                                            onClick={(data) => handleDrillDown(data)}
                                        />
                                        <Bar 
                                            dataKey="desperdicio" 
                                            name="Desperdicio" 
                                            stackId="a" 
                                            fill="#d13438" 
                                            barSize={14} 
                                            style={{ cursor: 'pointer' }}
                                            onClick={(data) => handleDrillDown(data)}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* ────── FILA 5: Mapa de clientes (CUADRO 6) ────── */}
                <Grid size={{ xs: 12 }}>
                    <ClientMapCard />
                </Grid>

            </Grid>

            {/* ── Order Detail Dialog ── */}
            <OrderDetailDialog
                open={Boolean(selectedOrder)}
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
            />
        </Box>
    );
}