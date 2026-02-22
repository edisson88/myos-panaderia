import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Grid,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";

import type { Kpi, QuickAction, AlertItem, RecentOrderRow } from "../modules/dashboard/dashboardTypes";

const kpis: Kpi[] = [
    { label: "Pedidos hoy", value: "18", helper: "Comparado con ayer", chipLabel: "+12%", chipColor: "success" },
    { label: "Ingresos estimados", value: "$ 1.245.000", helper: "Cierre al final del día", chipLabel: "Pendiente", chipColor: "warning" },
    { label: "Producción en curso", value: "6", helper: "Lotes activos", chipLabel: "En proceso", chipColor: "warning" },
    { label: "Entregas pendientes", value: "4", helper: "Antes de 4:00 p.m.", chipLabel: "Urgente", chipColor: "error" },
];

const quickActions: QuickAction[] = [
    { icon: "🧾", title: "Crear pedido", description: "Registrar pedido manual y generar PDF" },
    { icon: "👥", title: "Nuevo cliente", description: "Crear cliente y datos de contacto" },
    { icon: "🥐", title: "Nuevo producto", description: "Gestionar catálogo y precios" },
    { icon: "📄", title: "Orden del día (PDF)", description: "Consolidado diario para enviar" },
];

const alerts: AlertItem[] = [
    { icon: "⏱️", title: "Horneado: Pan campesino", description: "2 lotes para alistamiento (30 min)" },
    { icon: "📦", title: "Empaque: Galletas avena", description: "Faltan etiquetas del cliente “Café Niza”" },
    { icon: "🚚", title: "Entrega: Barrio Centro", description: "Ruta sugerida lista (3 pedidos)" },
];

const recentOrders: RecentOrderRow[] = [
    {
        date: "22/02/2026",
        customer: "María Cárdenas",
        delivery: "Hoy 3:00 p.m.",
        total: "$ 98.000",
        statusLabel: "En producción",
        statusColor: "warning",
        actions: [{ label: "Ver" }, { label: "PDF" }, { label: "Editar" }],
    },
    {
        date: "22/02/2026",
        customer: "Café Niza",
        delivery: "Mañana 8:00 a.m.",
        total: "$ 245.000",
        statusLabel: "Confirmado",
        statusColor: "success",
        actions: [{ label: "Ver" }, { label: "PDF" }, { label: "Editar" }],
    },
    {
        date: "21/02/2026",
        customer: "Juan Rojas",
        delivery: "Entregado",
        total: "$ 42.500",
        statusLabel: "Entregado",
        statusColor: "success",
        actions: [{ label: "Ver" }, { label: "PDF" }, { label: "Repetir" }],
    },
];

export default function DashboardPage() {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* KPIs */}
            <Grid container spacing={2}>
                {kpis.map((kpi) => (
                    <Grid size={{ xs: 12, md: 6, lg: 3 }} key={kpi.label}>
                        <Card>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            {kpi.label}
                                        </Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
                                            {kpi.value}
                                        </Typography>
                                    </Box>

                                    <Chip label={kpi.chipLabel} color={kpi.chipColor} variant="outlined" size="small" />
                                </Stack>

                                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                                    {kpi.helper}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Acciones rápidas + Alertas */}
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, lg: 7 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                                Acciones rápidas
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Atajos para operar más rápido
                            </Typography>

                            <Grid container spacing={2}>
                                {quickActions.map((qa) => (
                                    <Grid size={{ xs: 12, md: 6 }} key={qa.title}>
                                        <Card variant="outlined" sx={{ borderRadius: 3 }}>
                                            <CardContent>
                                                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                                    <Box
                                                        sx={{
                                                            width: 36,
                                                            height: 36,
                                                            borderRadius: 2,
                                                            display: "grid",
                                                            placeItems: "center",
                                                            bgcolor: "warning.light",
                                                            opacity: 0.9,
                                                        }}
                                                    >
                                                        <span aria-hidden="true">{qa.icon}</span>
                                                    </Box>

                                                    <Box>
                                                        <Typography sx={{ fontWeight: 800 }}>{qa.title}</Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {qa.description}
                                                        </Typography>
                                                    </Box>
                                                </Stack>

                                                {/* botón placeholder (luego conectas navegación/acciones) */}
                                                <Box sx={{ mt: 1.5 }}>
                                                    <Button size="small" variant="text">
                                                        Abrir
                                                    </Button>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, lg: 5 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                                Producción y alertas
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Lo que necesita atención
                            </Typography>

                            <Stack spacing={2}>
                                {alerts.map((a) => (
                                    <Card key={a.title} variant="outlined" sx={{ borderRadius: 3 }}>
                                        <CardContent>
                                            <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                                <Box
                                                    sx={{
                                                        width: 36,
                                                        height: 36,
                                                        borderRadius: 2,
                                                        display: "grid",
                                                        placeItems: "center",
                                                        bgcolor: "warning.light",
                                                        opacity: 0.9,
                                                    }}
                                                >
                                                    <span aria-hidden="true">{a.icon}</span>
                                                </Box>

                                                <Box>
                                                    <Typography sx={{ fontWeight: 800 }}>{a.title}</Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {a.description}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Tabla: pedidos recientes */}
            <Card>
                <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                        Pedidos recientes
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Estado actual de los últimos pedidos
                    </Typography>

                    <Box sx={{ overflowX: "auto" }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Fecha</TableCell>
                                    <TableCell>Cliente</TableCell>
                                    <TableCell>Entrega</TableCell>
                                    <TableCell>Total</TableCell>
                                    <TableCell>Estado</TableCell>
                                    <TableCell align="right">Acciones</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {recentOrders.map((row) => (
                                    <TableRow key={`${row.date}-${row.customer}`}>
                                        <TableCell>{row.date}</TableCell>
                                        <TableCell>{row.customer}</TableCell>
                                        <TableCell>{row.delivery}</TableCell>
                                        <TableCell>{row.total}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={row.statusLabel}
                                                color={row.statusColor}
                                                variant="outlined"
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                {row.actions.map((a) => (
                                                    <Button key={a.label} size="small" variant="text">
                                                        {a.label}
                                                    </Button>
                                                ))}
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}