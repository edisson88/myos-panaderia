import { useState } from "react";
import {
    Box,
    Card,
    CardContent,
    Grid,
    Stack,
    Typography,
    Divider,
    LinearProgress,
    Chip,
    Tabs,
    Tab,
} from "@mui/material";
import MiniCRM from "../components/MiniCRM";
import BarChartIcon from "@mui/icons-material/BarChart";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
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
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
} from "recharts";

// ── Mock Data ────────────────────────────────────────────────────────────────
const weeklyRevenue = [
    { name: "Lun", ventas: 1200000, meta: 1000000, costos: 600000 },
    { name: "Mar", ventas: 1400000, meta: 1000000, costos: 680000 },
    { name: "Mié", ventas: 1100000, meta: 1000000, costos: 540000 },
    { name: "Jue", ventas: 1600000, meta: 1200000, costos: 750000 },
    { name: "Vie", ventas: 2100000, meta: 1800000, costos: 900000 },
    { name: "Sáb", ventas: 2800000, meta: 2500000, costos: 1100000 },
    { name: "Dom", ventas: 3000000, meta: 2500000, costos: 1200000 },
];

const monthlyTrend = [
    { name: "Ene", ventas: 28000000 },
    { name: "Feb", ventas: 31000000 },
    { name: "Mar", ventas: 29000000 },
    { name: "Abr", ventas: 34000000 },
    { name: "May", ventas: 38000000 },
    { name: "Jun", ventas: 42000000 },
    { name: "Jul", ventas: 45000000 },
    { name: "Ago", ventas: 41000000 },
    { name: "Sep", ventas: 47000000 },
    { name: "Oct", ventas: 51000000 },
    { name: "Nov", ventas: 56000000 },
    { name: "Dic", ventas: 72000000 },
];

const productionData = [
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

const radarData = [
    { subject: "Puntualidad", A: 92 },
    { subject: "Calidad", A: 98 },
    { subject: "Producción", A: 87 },
    { subject: "Satisfacción", A: 95 },
    { subject: "Eficiencia", A: 80 },
    { subject: "Rentabilidad", A: 75 },
];

const kpis = [
    { label: "Ingresos Mes (COP)", value: "$ 56.2 M", delta: "+14.3 %", deltaColor: "#107c10" },
    { label: "Margen Bruto", value: "51 %", delta: "+2.1 pp", deltaColor: "#107c10" },
    { label: "Pedidos Completados", value: "1 284", delta: "+8.7 %", deltaColor: "#107c10" },
    { label: "Ticket Promedio (COP)", value: "$ 43 700", delta: "-1.2 %", deltaColor: "#a4262c" },
];

const objetivos = [
    { label: "Meta de Ingresos Mensual", actual: 56.2, target: 70, color: "#118dff" },
    { label: "Eficiencia de Producción", actual: 87, target: 100, color: "#00b894" },
    { label: "Satisfacción al Cliente", actual: 98, target: 100, color: "#f59e0b" },
    { label: "Reducción de Desperdicio", actual: 63, target: 80, color: "#a4262c" },
];

// ── Style tokens ──────────────────────────────────────────────────────────────
const panel = {
    borderRadius: 0,
    boxShadow: "none",
    border: "1px solid #e1dfdd",
    bgcolor: "#ffffff",
    height: "100%",
} as const;

// ── Component ─────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
    const [tabIndex, setTabIndex] = useState(0);

    return (
        <Box sx={{ bgcolor: "background.default", minHeight: "100vh", p: { xs: 1.5, md: 3 } }}>

            {/* ── Tabs ── */}
            <Tabs
                value={tabIndex}
                onChange={(_, newValue) => setTabIndex(newValue)}
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
                <Tab icon={<BarChartIcon sx={{ fontSize: 18, mr: 0.5 }} />} iconPosition="start" label="Cuadro de Mando Integral" />
                <Tab icon={<PeopleAltIcon sx={{ fontSize: 18, mr: 0.5 }} />} iconPosition="start" label="Mini CRM" />
            </Tabs>

            {/* ── Tab Panels ── */}
            {tabIndex === 0 && (
                <Grid container spacing={2}>

                {/* ── KPIs Row ── */}
                {kpis.map((kpi, i) => (
                    <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card sx={{ ...panel, borderTop: i === 1 ? "3px solid #0078d4" : "none" }}>
                            <CardContent sx={{ p: 2.5, pb: "20px !important" }}>
                                <Typography variant="caption" sx={{ color: "#605e5c", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.08em", display: "block", mb: 1 }}>
                                    {kpi.label}
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5 }}>
                                    <Typography variant="h4" sx={{ fontWeight: 300, color: "#323130", lineHeight: 1 }}>{kpi.value}</Typography>
                                    <Typography variant="body2" sx={{ color: kpi.deltaColor, fontWeight: 700 }}>{kpi.delta}</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}

                {/* ── Ingresos vs Meta vs Costos (área) ── */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Card sx={panel}>
                        <CardContent sx={{ p: 2.5, pb: "20px !important" }}>
                            <Typography variant="caption" sx={{ color: "#605e5c", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", mb: 2 }}>
                                Ingresos vs Meta vs Costos · Últimos 7 días
                            </Typography>
                            <Box sx={{ height: 260 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={weeklyRevenue} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#118dff" stopOpacity={0.7} />
                                                <stop offset="95%" stopColor="#118dff" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="gM" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#00b894" stopOpacity={0.35} />
                                                <stop offset="95%" stopColor="#00b894" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#d13438" stopOpacity={0.25} />
                                                <stop offset="95%" stopColor="#d13438" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1dfdd" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#605e5c" }} dy={8} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#605e5c" }} tickFormatter={(v: number) => `${(v / 1000000).toFixed(1)}M`} />
                                        <RechartsTooltip formatter={(v: unknown) => [`$ ${Number(v).toLocaleString("es-CO")}`, ""]} />
                                        <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: "#605e5c", paddingTop: 8 }} />
                                        <Area type="monotone" name="Costos" dataKey="costos" stroke="#d13438" strokeWidth={1.5} fillOpacity={1} fill="url(#gC)" />
                                        <Area type="monotone" name="Meta" dataKey="meta" stroke="#00b894" strokeWidth={2} fillOpacity={1} fill="url(#gM)" />
                                        <Area type="monotone" name="Ventas" dataKey="ventas" stroke="#118dff" strokeWidth={2} fillOpacity={1} fill="url(#gV)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* ── Radar CMI ── */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={panel}>
                        <CardContent sx={{ p: 2.5, pb: "20px !important" }}>
                            <Typography variant="caption" sx={{ color: "#605e5c", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", mb: 2 }}>
                                Radar de Desempeño Estratégico
                            </Typography>
                            <Box sx={{ height: 260 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart data={radarData}>
                                        <PolarGrid stroke="#e1dfdd" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#605e5c" }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: "#aaa" }} />
                                        <Radar name="Desempeño" dataKey="A" stroke="#0078d4" fill="#0078d4" fillOpacity={0.35} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* ── Tendencia Mensual (Line) ── */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Card sx={panel}>
                        <CardContent sx={{ p: 2.5, pb: "20px !important" }}>
                            <Typography variant="caption" sx={{ color: "#605e5c", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", mb: 2 }}>
                                Tendencia de Ingresos · Últimos 12 meses
                            </Typography>
                            <Box sx={{ height: 220 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={monthlyTrend} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1dfdd" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#605e5c" }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#605e5c" }} tickFormatter={(v: number) => `${(v / 1000000).toFixed(0)}M`} />
                                        <RechartsTooltip formatter={(v: unknown) => [`$ ${Number(v).toLocaleString("es-CO")}`, "Ingresos"]} />
                                        <Line type="monotone" dataKey="ventas" stroke="#118dff" strokeWidth={2.5} dot={{ r: 4, fill: "#118dff" }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* ── Mix de Ventas (Pie) ── */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={panel}>
                        <CardContent sx={{ p: 2.5, pb: "20px !important" }}>
                            <Typography variant="caption" sx={{ color: "#605e5c", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", mb: 2 }}>
                                Mix de Ventas por Categoría
                            </Typography>
                            <Box sx={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3} label={({ name, value }) => `${name} ${value}%`} labelLine={false}>
                                            {pieData.map((_, index) => (
                                                <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip formatter={(v: unknown) => [`${v}%`, "Participación"]} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* ── Producción vs Desperdicio ── */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={panel}>
                        <CardContent sx={{ p: 2.5, pb: "20px !important" }}>
                            <Typography variant="caption" sx={{ color: "#605e5c", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", mb: 2 }}>
                                Producción vs Desperdicio por Categoría
                            </Typography>
                            <Box sx={{ height: 220 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={productionData} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e1dfdd" />
                                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#605e5c" }} />
                                        <YAxis dataKey="category" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#323130" }} width={78} />
                                        <RechartsTooltip />
                                        <Legend iconType="square" wrapperStyle={{ fontSize: 12 }} />
                                        <Bar dataKey="cantidad" name="Producido" stackId="a" fill="#118dff" barSize={14} />
                                        <Bar dataKey="desperdicio" name="Desperdicio" stackId="a" fill="#d13438" barSize={14} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* ── Objetivos Estratégicos (Progress bars) ── */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={panel}>
                        <CardContent sx={{ p: 2.5, pb: "20px !important" }}>
                            <Typography variant="caption" sx={{ color: "#605e5c", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", mb: 2 }}>
                                Objetivos Estratégicos · Avance
                            </Typography>
                            <Stack spacing={2.5} mt={1}>
                                {objetivos.map((obj, i) => {
                                    const pct = Math.round((obj.actual / obj.target) * 100);
                                    return (
                                        <Box key={i}>
                                            <Stack direction="row" justifyContent="space-between" mb={0.5}>
                                                <Typography variant="caption" sx={{ color: "#323130", fontWeight: 600 }}>{obj.label}</Typography>
                                                <Typography variant="caption" sx={{ color: obj.color, fontWeight: 700 }}>{pct}%</Typography>
                                            </Stack>
                                            <LinearProgress
                                                variant="determinate"
                                                value={pct}
                                                sx={{
                                                    height: 6,
                                                    borderRadius: 0,
                                                    bgcolor: "#f3f2f1",
                                                    "& .MuiLinearProgress-bar": { bgcolor: obj.color, borderRadius: 0 },
                                                }}
                                            />
                                            <Typography variant="caption" sx={{ color: "#605e5c", fontSize: "0.7rem" }}>
                                                {typeof obj.actual === "number" && obj.label.includes("COP")
                                                    ? `$ ${obj.actual}M`
                                                    : `${obj.actual}`}{" "}
                                                / {obj.target}{obj.label.includes("COP") ? "M" : obj.label.includes("%") || obj.label.includes("ción") ? "%" : ""}
                                            </Typography>
                                        </Box>
                                    );
                                })}
                            </Stack>
                            <Divider sx={{ my: 2, borderColor: "#e1dfdd" }} />
                            <Typography variant="caption" sx={{ color: "#605e5c", fontStyle: "italic" }}>
                                Perspectivas: Financiera · Clientes · Procesos Internos · Aprendizaje y Crecimiento
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            )}

            {tabIndex === 1 && (
                <Box>
                    <MiniCRM />
                </Box>
            )}

        </Box>
    );
}
