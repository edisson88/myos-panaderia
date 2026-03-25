/**
 * MiniCRM — Sub-módulo de CRM dentro de Analítica
 *
 * Arquitectura frontend-only (mock data).
 * Para conectar al backend, reemplaza CRM_CLIENTS con llamadas a la API.
 * Ver el artefacto "crm_backend_guide.md" para instrucciones de integración.
 */

import { useState, useMemo } from "react";
import {
    Box, Stack, Typography, Chip, Card, CardContent, Divider,
    TextField, InputAdornment, Select, MenuItem, FormControl,
    InputLabel, Table, TableBody, TableCell, TableHead, TableRow,
    Drawer, Avatar, IconButton, Button, Badge, LinearProgress,
    Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import StarIcon from "@mui/icons-material/Star";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AddIcon from "@mui/icons-material/Add";
import EventNoteIcon from "@mui/icons-material/EventNote";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import PersonIcon from "@mui/icons-material/Person";
import StorefrontIcon from "@mui/icons-material/Storefront";
import DiamondIcon from "@mui/icons-material/Diamond";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import HandshakeIcon from "@mui/icons-material/Handshake";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import TableRowsIcon from "@mui/icons-material/TableRows";

// ── Types ─────────────────────────────────────────────────────────────────────
type CrmStage = "Prospecto" | "Activo" | "VIP" | "En riesgo" | "Inactivo";
type InteractionType = "llamada" | "pedido" | "nota" | "visita" | "cotizacion";

interface Interaction {
    date: string;
    type: InteractionType;
    note: string;
    user: string;
}

interface CrmClient {
    id: string;
    name: string;
    category: string;
    stage: CrmStage;
    email: string;
    phone: string;
    address: string;
    commune: string;
    totalOrders: number;
    totalRevenue: number;      // COP
    avgOrderValue: number;     // COP
    lastOrderDate: string;
    daysSinceLastOrder: number;
    nps: number;               // 1-10
    interactions: Interaction[];
    tags: string[];
    assignedTo: string;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────
// 🔌 INTEGRACIÓN BACKEND: Reemplazar este array con `useEffect(() => { fetch("/api/crm/clients") ... })`
const CRM_CLIENTS: CrmClient[] = [
    {
        id: "crm-001", name: "Hotel Lux Ibagué", category: "Hotelería", stage: "VIP",
        email: "compras@hotellux.com", phone: "+57 8 263 1234",
        address: "Calle 37 # 2-12", commune: "Comuna 2 – Centro",
        totalOrders: 32, totalRevenue: 4800000, avgOrderValue: 150000,
        lastOrderDate: "2025-03-24", daysSinceLastOrder: 1, nps: 9,
        tags: ["Alto Valor", "Fiel", "Semanal"],
        assignedTo: "Ana Torres",
        interactions: [
            { date: "2025-03-24", type: "pedido", note: "Pedido semanal regular: Pan artesanal x20, Baguette x10", user: "Ana Torres" },
            { date: "2025-03-18", type: "llamada", note: "Confirmación de pedido especial para evento corporativo", user: "Ana Torres" },
            { date: "2025-03-10", type: "visita", note: "Visita comercial, renovación contrato mensual", user: "Carlos Gómez" },
            { date: "2025-02-28", type: "nota", note: "Cliente solicita empaque personalizado con logo", user: "Ana Torres" },
        ],
    },
    {
        id: "crm-002", name: "Restaurante El Parque", category: "Restaurante", stage: "VIP",
        email: "pedidos@elparque.com.co", phone: "+57 8 261 5678",
        address: "Carrera 3 # 10-45", commune: "Comuna 2 – Centro",
        totalOrders: 24, totalRevenue: 2160000, avgOrderValue: 90000,
        lastOrderDate: "2025-03-23", daysSinceLastOrder: 2, nps: 8,
        tags: ["Alto Valor", "Restaurante", "Diario"],
        assignedTo: "Carlos Gómez",
        interactions: [
            { date: "2025-03-23", type: "pedido", note: "Pan de la casa diario: Baguette x5, Ciabatta x3", user: "Carlos Gómez" },
            { date: "2025-03-15", type: "cotizacion", note: "Cotización para menú de temporada Semana Santa", user: "Carlos Gómez" },
        ],
    },
    {
        id: "crm-003", name: "Merca Todo Los Tunjos", category: "Supermercado", stage: "Activo",
        email: "compras@mercatodo.com", phone: "+57 300 456 7890",
        address: "Av. Guabinal # 89-20", commune: "Comuna 10",
        totalOrders: 22, totalRevenue: 2420000, avgOrderValue: 110000,
        lastOrderDate: "2025-03-20", daysSinceLastOrder: 5, nps: 7,
        tags: ["Supermercado", "Quincenal"],
        assignedTo: "Ana Torres",
        interactions: [
            { date: "2025-03-20", type: "pedido", note: "Pan empacado para góndola", user: "Ana Torres" },
            { date: "2025-03-05", type: "llamada", note: "Negociación de condiciones de pago a 30 días", user: "Ana Torres" },
        ],
    },
    {
        id: "crm-004", name: "Club Calarco", category: "Restaurante", stage: "Activo",
        email: "eventos@calarco.com", phone: "+57 8 265 9999",
        address: "Calle 60 # 1-50", commune: "Comuna 9",
        totalOrders: 20, totalRevenue: 2800000, avgOrderValue: 140000,
        lastOrderDate: "2025-03-22", daysSinceLastOrder: 3, nps: 8,
        tags: ["Club", "Eventos", "Mensual"],
        assignedTo: "Luis Mora",
        interactions: [
            { date: "2025-03-22", type: "pedido", note: "Paquete para evento de fin de semana", user: "Luis Mora" },
            { date: "2025-03-01", type: "visita", note: "Presentación catálogo Semana Santa", user: "Luis Mora" },
        ],
    },
    {
        id: "crm-005", name: "Catering El Vergel", category: "Catering", stage: "Activo",
        email: "info@cateringvergel.co", phone: "+57 310 123 9876",
        address: "Cra 7 # 52-18", commune: "Comuna 8",
        totalOrders: 14, totalRevenue: 1540000, avgOrderValue: 110000,
        lastOrderDate: "2025-03-18", daysSinceLastOrder: 7, nps: 7,
        tags: ["Catering", "Eventos"],
        assignedTo: "Carlos Gómez",
        interactions: [
            { date: "2025-03-18", type: "pedido", note: "Buffet para grado universidad", user: "Carlos Gómez" },
        ],
    },
    {
        id: "crm-006", name: "Panadería La Pola", category: "Distribuidor", stage: "En riesgo",
        email: "lapola@gmail.com", phone: "+57 317 654 3210",
        address: "Calle 105 # 3-22", commune: "Comuna 1 – Norte",
        totalOrders: 18, totalRevenue: 1620000, avgOrderValue: 90000,
        lastOrderDate: "2025-02-28", daysSinceLastOrder: 25, nps: 5,
        tags: ["Distribuidor", "Irregular"],
        assignedTo: "Ana Torres",
        interactions: [
            { date: "2025-02-28", type: "pedido", note: "Último pedido regular", user: "Ana Torres" },
            { date: "2025-03-10", type: "llamada", note: "Sin respuesta — 3 intentos de contacto", user: "Ana Torres" },
            { date: "2025-03-20", type: "nota", note: "⚠️ Cliente con riesgo de churn. Programar visita.", user: "Carlos Gómez" },
        ],
    },
    {
        id: "crm-007", name: "Supermercado Jardín", category: "Supermercado", stage: "Activo",
        email: "gerencia@smjardin.com", phone: "+57 8 260 1111",
        address: "Av. Ambala # 45-10", commune: "Comuna 4",
        totalOrders: 28, totalRevenue: 3360000, avgOrderValue: 120000,
        lastOrderDate: "2025-03-21", daysSinceLastOrder: 4, nps: 8,
        tags: ["Supermercado", "Alto Valor"],
        assignedTo: "Luis Mora",
        interactions: [
            { date: "2025-03-21", type: "pedido", note: "Reposición semanal de vitrinas", user: "Luis Mora" },
        ],
    },
    {
        id: "crm-008", name: "Finca Calambeo", category: "Distribución", stage: "Inactivo",
        email: "fincacalambeo@hotmail.com", phone: "+57 311 222 3344",
        address: "Km 4 Vía al Nevado", commune: "Comuna 6",
        totalOrders: 4, totalRevenue: 280000, avgOrderValue: 70000,
        lastOrderDate: "2025-01-15", daysSinceLastOrder: 68, nps: 4,
        tags: ["Inactivo", "Rural"],
        assignedTo: "Carlos Gómez",
        interactions: [
            { date: "2025-01-15", type: "pedido", note: "Pedido aislado para evento privado", user: "Carlos Gómez" },
            { date: "2025-02-01", type: "llamada", note: "No contestó. Buzón lleno.", user: "Carlos Gómez" },
        ],
    },
    {
        id: "crm-009", name: "Cafetería Castilla", category: "Cafetería", stage: "Activo",
        email: "castilla.cafe@gmail.com", phone: "+57 315 789 0011",
        address: "Calle 98 # 5-33", commune: "Comuna 11",
        totalOrders: 11, totalRevenue: 660000, avgOrderValue: 60000,
        lastOrderDate: "2025-03-19", daysSinceLastOrder: 6, nps: 9,
        tags: ["Cafetería", "Frecuente"],
        assignedTo: "Ana Torres",
        interactions: [
            { date: "2025-03-19", type: "pedido", note: "Croissants y mogollas para la semana", user: "Ana Torres" },
            { date: "2025-03-12", type: "nota", note: "Cliente recomendó a Cafetería El Lago (prospecto nuevo)", user: "Ana Torres" },
        ],
    },
    {
        id: "crm-010", name: "Eventos Santander", category: "Eventos", stage: "Prospecto",
        email: "contacto@eventossantander.com", phone: "+57 320 555 7788",
        address: "Cra 9 # 61-15", commune: "Bucaramanga",
        totalOrders: 0, totalRevenue: 0, avgOrderValue: 0,
        lastOrderDate: "—", daysSinceLastOrder: 999, nps: 0,
        tags: ["Nuevo", "Prospecto"],
        assignedTo: "Luis Mora",
        interactions: [
            { date: "2025-03-22", type: "cotizacion", note: "Solicitud de cotización para 3 eventos en abril", user: "Luis Mora" },
            { date: "2025-03-22", type: "llamada", note: "Primera llamada — interesado en pan artesanal para eventos", user: "Luis Mora" },
        ],
    },
];

// ── Config ────────────────────────────────────────────────────────────────────
const STAGES: { id: CrmStage; color: string; bg: string; icon: React.ReactNode }[] = [
    { id: "Prospecto",  color: "#a78bfa", bg: "#a78bfa18", icon: <StorefrontIcon sx={{ fontSize: 14, mb: "-2px" }} /> },
    { id: "Activo",     color: "#0078d4", bg: "#0078d418", icon: <CheckCircleOutlineIcon sx={{ fontSize: 14, mb: "-2px" }} /> },
    { id: "VIP",        color: "#f59e0b", bg: "#f59e0b18", icon: <DiamondIcon sx={{ fontSize: 14, mb: "-2px" }} /> },
    { id: "En riesgo",  color: "#a4262c", bg: "#a4262c18", icon: <WarningAmberIcon sx={{ fontSize: 14, mb: "-2px" }} /> },
    { id: "Inactivo",   color: "#888",    bg: "#88888815", icon: <PauseCircleOutlineIcon sx={{ fontSize: 14, mb: "-2px" }} /> },
];

const INTERACTION_ICONS: Record<InteractionType, React.ReactNode> = {
    llamada: <PhoneIcon sx={{ fontSize: 14 }} />, 
    pedido: <ShoppingBagIcon sx={{ fontSize: 14 }} />, 
    nota: <EventNoteIcon sx={{ fontSize: 14 }} />, 
    visita: <HandshakeIcon sx={{ fontSize: 14 }} />, 
    cotizacion: <RequestQuoteIcon sx={{ fontSize: 14 }} />,
};

const fmtCOP = (v: number) => v > 0 ? `$ ${v.toLocaleString("es-CO")}` : "—";
const initials = (name: string) => name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
const stageConfig = (stage: CrmStage) => STAGES.find(s => s.id === stage)!;

// ── KPI strip ─────────────────────────────────────────────────────────────────
function CrmKpiStrip({ clients }: { clients: CrmClient[] }) {
    const total    = clients.length;
    const active   = clients.filter(c => c.stage === "Activo" || c.stage === "VIP").length;
    const atRisk   = clients.filter(c => c.stage === "En riesgo").length;
    const revenue  = clients.reduce((a, c) => a + c.totalRevenue, 0);
    const avgNps   = clients.filter(c => c.nps > 0).reduce((a, c, _, arr) => a + c.nps / arr.length, 0);
    const retention = total > 0 ? Math.round((active / total) * 100) : 0;

    const kpis = [
        { label: "Clientes totales",    value: total,              suffix: "",   color: "#323130" },
        { label: "Tasa de constancia",  value: `${retention}%`,   suffix: "",   color: "#107c10" },
        { label: "En riesgo / Inactivo",value: atRisk,             suffix: "",   color: "#a4262c" },
        { label: "Ingresos acumulados", value: fmtCOP(revenue),   suffix: "",   color: "#0078d4" },
        { label: "Nivel Satisfacción",  value: avgNps.toFixed(1), suffix: "/10", color: "#f59e0b" },
    ];

    return (
        <Stack direction="row" spacing={1.5} mb={2} flexWrap="wrap">
            {kpis.map((k, i) => (
                <Card key={i} sx={{ flex: "1 1 140px", minWidth: 120, borderRadius: 0, boxShadow: "none", border: "1px solid #e1dfdd" }}>
                    <CardContent sx={{ p: 1.5, pb: "12px !important" }}>
                        <Typography variant="caption" sx={{ color: "#888", display: "block", mb: 0.5, fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            {k.label}
                        </Typography>
                        <Typography sx={{ fontWeight: 700, color: k.color, fontSize: "1.1rem", lineHeight: 1 }}>
                            {k.value}<span style={{ fontSize: "0.75rem", color: "#888" }}>{k.suffix}</span>
                        </Typography>
                    </CardContent>
                </Card>
            ))}
        </Stack>
    );
}

// ── Pipeline Kanban ───────────────────────────────────────────────────────────
function PipelineBoard({ clients, onSelect }: { clients: CrmClient[]; onSelect: (c: CrmClient) => void }) {
    return (
        <Box mb={3}>
            <Typography variant="caption" sx={{ color: "#888", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", mb: 1.5 }}>
                Seguimiento de Clientes
            </Typography>
            <Box sx={{ display: "flex", gap: 1.5, overflowX: "auto", pb: 1 }}>
                {STAGES.map((stage) => {
                    const stageClients = clients.filter(c => c.stage === stage.id);
                    const stageRevenue = stageClients.reduce((a, c) => a + c.totalRevenue, 0);
                    return (
                        <Box key={stage.id} sx={{ minWidth: 180, flex: "0 0 180px" }}>
                            {/* Column header */}
                            <Box sx={{ bgcolor: stage.bg, border: `1px solid ${stage.color}30`, borderRadius: 0, px: 1.5, py: 1, mb: 1 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: stage.color }}>
                                        {stage.icon} {stage.id}
                                    </Typography>
                                    <Chip label={stageClients.length} size="small" sx={{ height: 18, fontSize: "0.65rem", fontWeight: 700, bgcolor: stage.color, color: "white" }} />
                                </Stack>
                                {stageRevenue > 0 && (
                                    <Typography sx={{ fontSize: "0.65rem", color: "#888", mt: 0.3 }}>
                                        {fmtCOP(stageRevenue)}
                                    </Typography>
                                )}
                            </Box>

                            {/* Cards */}
                            <Stack spacing={1}>
                                {stageClients.map((client) => (
                                    <Card
                                        key={client.id}
                                        onClick={() => onSelect(client)}
                                        sx={{
                                            borderRadius: 0, boxShadow: "none", border: "1px solid #e1dfdd",
                                            cursor: "pointer", transition: "all 0.15s",
                                            "&:hover": { borderColor: stage.color, boxShadow: `0 2px 12px ${stage.color}20`, transform: "translateY(-1px)" },
                                        }}
                                    >
                                        <CardContent sx={{ p: 1.5, pb: "12px !important" }}>
                                            <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                                                <Avatar variant="square" sx={{ width: 26, height: 26, fontSize: "0.65rem", fontWeight: 700, bgcolor: stage.color }}>
                                                    {initials(client.name)}
                                                </Avatar>
                                                <Box sx={{ minWidth: 0 }}>
                                                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#323130", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                        {client.name}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: "0.65rem", color: "#888" }}>{client.category}</Typography>
                                                </Box>
                                            </Stack>

                                            {client.totalRevenue > 0 && (
                                                <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#107c10" }}>
                                                    {fmtCOP(client.totalRevenue)}
                                                </Typography>
                                            )}

                                            {client.stage === "En riesgo" && (
                                                <Stack direction="row" spacing={0.4} alignItems="center" mt={0.5}>
                                                    <WarningAmberIcon sx={{ fontSize: 11, color: "#a4262c" }} />
                                                    <Typography sx={{ fontSize: "0.65rem", color: "#a4262c" }}>
                                                        {client.daysSinceLastOrder}d sin pedido
                                                    </Typography>
                                                </Stack>
                                            )}

                                            <Typography sx={{ fontSize: "0.62rem", color: "#aaa", mt: 0.5 }}>
                                                👤 {client.assignedTo}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                ))}
                                {stageClients.length === 0 && (
                                    <Box sx={{ border: "1px dashed #e1dfdd", borderRadius: 0, p: 2, textAlign: "center" }}>
                                        <Typography sx={{ fontSize: "0.7rem", color: "#bbb" }}>Vacío</Typography>
                                    </Box>
                                )}
                            </Stack>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
}

// ── Client Detail Drawer ──────────────────────────────────────────────────────
function ClientDrawer({ client, onClose }: { client: CrmClient | null; onClose: () => void }) {
    const [newNote, setNewNote] = useState("");

    if (!client) return null;
    const sc = stageConfig(client.stage);

    return (
        <Drawer
            anchor="right"
            open={Boolean(client)}
            onClose={onClose}
            PaperProps={{ sx: { width: { xs: "100%", sm: 420 }, p: 0 } }}
        >
            {/* Header */}
            <Box sx={{ background: `linear-gradient(135deg, #6B3A2A 0%, #8b4f3d 100%)`, px: 3, pt: 2.5, pb: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar variant="square" sx={{ width: 42, height: 42, fontSize: "1rem", fontWeight: 800, bgcolor: "rgba(255,255,255,0.2)" }}>
                            {initials(client.name)}
                        </Avatar>
                        <Box>
                            <Typography sx={{ color: "white", fontWeight: 800, fontSize: "1rem", lineHeight: 1.1 }}>
                                {client.name}
                            </Typography>
                            <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: "0.75rem" }}>
                                {client.category} · {client.commune}
                            </Typography>
                        </Box>
                    </Stack>
                    <IconButton onClick={onClose} size="small" sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: "white", bgcolor: "rgba(255,255,255,0.1)" } }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Stack>
                <Stack direction="row" spacing={1} mt={1.5}>
                    <Chip label={`${sc.icon} ${client.stage}`} size="small" sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "white", fontWeight: 700, fontSize: "0.7rem" }} />
                    <Chip label={`👤 ${client.assignedTo}`} size="small" sx={{ bgcolor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)", fontSize: "0.7rem" }} />
                </Stack>
            </Box>

            <Box sx={{ flex: 1, overflowY: "auto", p: 2.5 }}>

                {/* Contact info */}
                <Stack spacing={0.8} mb={2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <EmailIcon sx={{ fontSize: 14, color: "#888" }} />
                        <Typography variant="caption" sx={{ color: "#605e5c" }}>{client.email}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <PhoneIcon sx={{ fontSize: 14, color: "#888" }} />
                        <Typography variant="caption" sx={{ color: "#605e5c" }}>{client.phone}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <LocationOnIcon sx={{ fontSize: 14, color: "#888" }} />
                        <Typography variant="caption" sx={{ color: "#605e5c" }}>{client.address}</Typography>
                    </Stack>
                </Stack>

                <Divider sx={{ borderColor: "#f3f2f1", mb: 2 }} />

                {/* KPI Cards */}
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, mb: 2 }}>
                    {[
                        { label: "Pedidos totales", value: client.totalOrders, icon: <ShoppingBagIcon sx={{ fontSize: 14 }} />, color: "#0078d4" },
                        { label: "Ingresos totales", value: fmtCOP(client.totalRevenue), icon: <TrendingUpIcon sx={{ fontSize: 14 }} />, color: "#107c10" },
                        { label: "Ticket promedio", value: fmtCOP(client.avgOrderValue), icon: <PersonIcon sx={{ fontSize: 14 }} />, color: "#605e5c" },
                        { label: "Nivel de Satisfacción", value: `${client.nps > 0 ? client.nps : "—"}/10`, icon: <StarIcon sx={{ fontSize: 14 }} />, color: "#f59e0b" },
                    ].map((kpi, i) => (
                        <Box key={i} sx={{ bgcolor: "#faf9f8", borderRadius: 0, p: 1.2, border: "1px solid #e1dfdd" }}>
                            <Stack direction="row" spacing={0.5} alignItems="center" mb={0.3}>
                                <Box sx={{ color: kpi.color }}>{kpi.icon}</Box>
                                <Typography sx={{ fontSize: "0.65rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>{kpi.label}</Typography>
                            </Stack>
                            <Typography sx={{ fontWeight: 700, color: kpi.color, fontSize: "0.9rem" }}>{kpi.value}</Typography>
                        </Box>
                    ))}
                </Box>

                {/* Last order & days */}
                <Box sx={{ bgcolor: client.daysSinceLastOrder > 20 ? "#fff4f4" : "#f6fff8", borderRadius: 0, px: 2, py: 1.2, border: `1px solid ${client.daysSinceLastOrder > 20 ? "#ffcccc" : "#d4f0dc"}`, mb: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography sx={{ fontSize: "0.65rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.06em" }}>Último pedido</Typography>
                            <Typography sx={{ fontWeight: 700, color: "#323130", fontSize: "0.85rem" }}>{client.lastOrderDate}</Typography>
                        </Box>
                        <Chip
                            label={client.daysSinceLastOrder < 999 ? `Hace ${client.daysSinceLastOrder}d` : "Sin pedidos"}
                            size="small"
                            sx={{
                                fontWeight: 700, fontSize: "0.7rem",
                                bgcolor: client.daysSinceLastOrder > 20 ? "#a4262c15" : "#107c1015",
                                color: client.daysSinceLastOrder > 20 ? "#a4262c" : "#107c10",
                            }}
                        />
                    </Stack>
                </Box>

                {/* NPS Bar */}
                {client.nps > 0 && (
                    <Box mb={2}>
                        <Stack direction="row" justifyContent="space-between" mb={0.5}>
                            <Typography sx={{ fontSize: "0.7rem", color: "#888", fontWeight: 600 }}>Satisfacción (NPS)</Typography>
                            <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: client.nps >= 8 ? "#107c10" : client.nps >= 6 ? "#f59e0b" : "#a4262c" }}>
                                {client.nps}/10
                            </Typography>
                        </Stack>
                        <LinearProgress
                            variant="determinate"
                            value={client.nps * 10}
                            sx={{
                                height: 6, borderRadius: 0, bgcolor: "#f3f2f1",
                                "& .MuiLinearProgress-bar": {
                                    bgcolor: client.nps >= 8 ? "#107c10" : client.nps >= 6 ? "#f59e0b" : "#a4262c",
                                    borderRadius: 0,
                                },
                            }}
                        />
                    </Box>
                )}

                {/* Tags */}
                {client.tags.length > 0 && (
                    <Stack direction="row" flexWrap="wrap" gap={0.5} mb={2}>
                        {client.tags.map((tag, i) => (
                            <Chip key={i} label={tag} size="small" sx={{ height: 20, fontSize: "0.65rem", bgcolor: "#f3f2f1", color: "#605e5c" }} />
                        ))}
                    </Stack>
                )}

                <Divider sx={{ borderColor: "#f3f2f1", mb: 2 }} />

                {/* Interaction Timeline */}
                <Typography sx={{ fontSize: "0.7rem", color: "#888", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", mb: 1.5 }}>
                    Historial de Interacciones
                </Typography>
                <Stack spacing={1.5} mb={2}>
                    {client.interactions.map((intx, i) => (
                        <Stack key={i} direction="row" spacing={1.5} alignItems="flex-start">
                            <Box sx={{
                                width: 28, height: 28, borderRadius: "50%",
                                bgcolor: "#f3f2f1", display: "flex", alignItems: "center",
                                justifyContent: "center", fontSize: 13, flexShrink: 0,
                            }}>
                                {INTERACTION_ICONS[intx.type]}
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                    <Typography sx={{ fontSize: "0.78rem", color: "#323130", lineHeight: 1.3 }}>{intx.note}</Typography>
                                </Stack>
                                <Stack direction="row" spacing={1} mt={0.3}>
                                    <Typography sx={{ fontSize: "0.65rem", color: "#aaa" }}>{intx.date}</Typography>
                                    <Typography sx={{ fontSize: "0.65rem", color: "#aaa" }}>· {intx.user}</Typography>
                                </Stack>
                            </Box>
                        </Stack>
                    ))}
                </Stack>

                {/* Add note */}
                <Box sx={{ bgcolor: "#faf9f8", borderRadius: 0, p: 1.5, border: "1px solid #e1dfdd" }}>
                    <Typography sx={{ fontSize: "0.7rem", color: "#888", fontWeight: 600, mb: 1 }}>Agregar nota / interacción</Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={2}
                        size="small"
                        placeholder="Escribe una nota o acción tomada..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        sx={{ mb: 1, "& .MuiOutlinedInput-root": { borderRadius: 0, bgcolor: "white", fontSize: "0.8rem" } }}
                    />
                    <Tooltip title="🔌 Conectar a POST /api/crm/interactions">
                        <span>
                            <Button
                                size="small"
                                variant="contained"
                                startIcon={<AddIcon />}
                                disabled={!newNote.trim()}
                                sx={{ textTransform: "none", borderRadius: 0, bgcolor: "#6B3A2A", "&:hover": { bgcolor: "#8b4f3d" }, fontSize: "0.75rem" }}
                                onClick={() => {
                                    // 🔌 INTEGRACIÓN: POST /api/crm/interactions { clientId, note, type: "nota", date: today }
                                    setNewNote("");
                                }}
                            >
                                Guardar nota
                            </Button>
                        </span>
                    </Tooltip>
                </Box>
            </Box>
        </Drawer>
    );
}

// ── Main CRM Component ────────────────────────────────────────────────────────
export default function MiniCRM() {
    const [search, setSearch] = useState("");
    const [filterStage, setFilterStage] = useState<string>("Todos");
    const [filterAssigned, setFilterAssigned] = useState<string>("Todos");
    const [selectedClient, setSelectedClient] = useState<CrmClient | null>(null);
    const [view, setView] = useState<"pipeline" | "tabla">("pipeline");

    const agents = ["Todos", ...Array.from(new Set(CRM_CLIENTS.map(c => c.assignedTo)))];

    const filtered = useMemo(() => {
        let list = CRM_CLIENTS;
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(c =>
                c.name.toLowerCase().includes(q) ||
                c.category.toLowerCase().includes(q) ||
                c.commune.toLowerCase().includes(q)
            );
        }
        if (filterStage !== "Todos") list = list.filter(c => c.stage === filterStage);
        if (filterAssigned !== "Todos") list = list.filter(c => c.assignedTo === filterAssigned);
        return list;
    }, [search, filterStage, filterAssigned]);

    return (
        <Box>
            {/* ── Section header ── */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#323130", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                        Mini CRM · Gestión de Clientes
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#605e5c" }}>
                        Gestión visual de ventas · Historial de atención · Análisis de lealtad
                    </Typography>
                </Box>
                <Tooltip title="🔌 Conectar a POST /api/crm/clients">
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<AddIcon />}
                        sx={{ textTransform: "none", borderRadius: 0, bgcolor: "#6B3A2A", "&:hover": { bgcolor: "#8b4f3d" }, fontWeight: 700, px: 2 }}
                    >
                        Nuevo cliente
                    </Button>
                </Tooltip>
            </Stack>

            {/* ── KPIs ── */}
            <CrmKpiStrip clients={filtered} />

            {/* ── Filters & view toggle ── */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} mb={2} alignItems={{ sm: "center" }}>
                <TextField
                    size="small"
                    placeholder="Buscar por nombre, categoría o zona..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: "#888" }} /></InputAdornment> }}
                    sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 0, bgcolor: "white", fontSize: "0.82rem" } }}
                />
                <FormControl size="small" sx={{ minWidth: 130 }}>
                    <InputLabel sx={{ fontSize: "0.8rem" }}>Etapa</InputLabel>
                    <Select value={filterStage} label="Etapa" onChange={e => setFilterStage(e.target.value)} sx={{ fontSize: "0.8rem", borderRadius: 0 }}>
                        <MenuItem value="Todos">Todos</MenuItem>
                        {STAGES.map(s => <MenuItem key={s.id} value={s.id} sx={{ fontSize: "0.8rem" }}>{s.icon} {s.id}</MenuItem>)}
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 130 }}>
                    <InputLabel sx={{ fontSize: "0.8rem" }}>Asesor</InputLabel>
                    <Select value={filterAssigned} label="Asesor" onChange={e => setFilterAssigned(e.target.value)} sx={{ fontSize: "0.8rem", borderRadius: 0 }}>
                        {agents.map(a => <MenuItem key={a} value={a} sx={{ fontSize: "0.8rem" }}>{a}</MenuItem>)}
                    </Select>
                </FormControl>

                {/* View toggle */}
                <Stack direction="row" spacing={0.5} sx={{ bgcolor: "#f3f2f1", borderRadius: 0, p: 0.5 }}>
                    {(["pipeline", "tabla"] as const).map(v => (
                        <Button
                            key={v}
                            size="small"
                            onClick={() => setView(v)}
                            sx={{
                                textTransform: "none", borderRadius: 0, fontSize: "0.75rem", px: 1.5,
                                bgcolor: view === v ? "white" : "transparent",
                                color: view === v ? "#323130" : "#888",
                                fontWeight: view === v ? 700 : 400,
                                boxShadow: view === v ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                                minWidth: 80,
                            }}
                        >
                            <Box component="span" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                {v === "pipeline" ? <ViewColumnIcon sx={{ fontSize: 14 }} /> : <TableRowsIcon sx={{ fontSize: 14 }} />}
                                {v === "pipeline" ? "Vista de Columnas" : "Vista de Lista"}
                            </Box>
                        </Button>
                    ))}
                </Stack>
            </Stack>

            {/* ── Pipeline view ── */}
            {view === "pipeline" && (
                <PipelineBoard clients={filtered} onSelect={setSelectedClient} />
            )}

            {/* ── Table view ── */}
            {view === "tabla" && (
                <Card sx={{ borderRadius: 0, boxShadow: "none", border: "1px solid #e1dfdd", mb: 2 }}>
                    <Table size="small" sx={{ "& .MuiTableCell-root": { borderBottom: "1px solid #f3f2f1", py: 1.2, px: 1.5, fontSize: "0.82rem" } }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: "#faf9f8" }}>
                                {["Cliente", "Etapa", "Categoría", "Asesor", "Pedidos", "Ingresos", "Últ. Pedido", "NPS"].map(h => (
                                    <TableCell key={h} sx={{ fontWeight: 700, color: "#605e5c", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                        {h}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filtered.map(client => {
                                const sc = stageConfig(client.stage);
                                return (
                                    <TableRow
                                        key={client.id}
                                        onClick={() => setSelectedClient(client)}
                                        sx={{ cursor: "pointer", "&:hover": { bgcolor: "#f8f7ff" } }}
                                    >
                                        <TableCell>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Avatar variant="square" sx={{ width: 28, height: 28, fontSize: "0.65rem", fontWeight: 700, bgcolor: sc.color }}>
                                                    {initials(client.name)}
                                                </Avatar>
                                                <Box>
                                                    <Typography sx={{ fontWeight: 600, fontSize: "0.82rem" }}>{client.name}</Typography>
                                                    <Typography sx={{ fontSize: "0.65rem", color: "#888" }}>{client.commune}</Typography>
                                                </Box>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={`${sc.icon} ${client.stage}`} size="small" sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700, bgcolor: sc.bg, color: sc.color }} />
                                        </TableCell>
                                        <TableCell sx={{ color: "#605e5c" }}>{client.category}</TableCell>
                                        <TableCell sx={{ color: "#605e5c", fontSize: "0.75rem" }}>{client.assignedTo}</TableCell>
                                        <TableCell>
                                            <Badge badgeContent={client.totalOrders} color="primary" max={999} sx={{ "& .MuiBadge-badge": { fontSize: "0.65rem", fontWeight: 700 } }}>
                                                <ShoppingBagIcon sx={{ fontSize: 16, color: "#888" }} />
                                            </Badge>
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: "#107c10" }}>{fmtCOP(client.totalRevenue)}</TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={0.5} alignItems="center">
                                                <EventNoteIcon sx={{ fontSize: 12, color: "#888" }} />
                                                <Typography sx={{ fontSize: "0.75rem", color: client.daysSinceLastOrder > 20 ? "#a4262c" : "#323130" }}>
                                                    {client.lastOrderDate}
                                                </Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            {client.nps > 0 && (
                                                <Stack direction="row" spacing={0.4} alignItems="center">
                                                    <StarIcon sx={{ fontSize: 12, color: "#f59e0b" }} />
                                                    <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: client.nps >= 8 ? "#107c10" : client.nps >= 6 ? "#f59e0b" : "#a4262c" }}>
                                                        {client.nps}
                                                    </Typography>
                                                </Stack>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                    {filtered.length === 0 && (
                        <Box sx={{ textAlign: "center", py: 4 }}>
                            <Typography variant="caption" color="text.secondary">No se encontraron clientes con los filtros aplicados</Typography>
                        </Box>
                    )}
                </Card>
            )}

            {/* ── "En riesgo" alert strip ── */}
            {filtered.filter(c => c.stage === "En riesgo").length > 0 && (
                <Card sx={{ borderRadius: 0, boxShadow: "none", border: "1px solid #f9d4d5", bgcolor: "#fff8f8" }}>
                    <CardContent sx={{ p: 2, pb: "16px !important" }}>
                        <Stack direction="row" spacing={1} alignItems="flex-start">
                            <WarningAmberIcon sx={{ color: "#a4262c", fontSize: 18, mt: 0.2 }} />
                            <Box>
                                <Typography sx={{ fontWeight: 700, color: "#a4262c", fontSize: "0.82rem" }}>
                                    {filtered.filter(c => c.stage === "En riesgo").length} cliente(s) con posible abandono
                                </Typography>
                                <Typography variant="caption" sx={{ color: "#605e5c" }}>
                                    {filtered.filter(c => c.stage === "En riesgo").map(c => c.name).join(" · ")} — Requieren seguimiento para no perderles.
                                </Typography>
                                <Stack direction="row" spacing={1} mt={1}>
                                    {filtered.filter(c => c.stage === "En riesgo").map(c => (
                                        <Button key={c.id} size="small" startIcon={<CheckCircleOutlineIcon />}
                                            onClick={() => setSelectedClient(c)}
                                            sx={{ textTransform: "none", fontSize: "0.72rem", borderRadius: 0, border: "1px solid #a4262c30", color: "#a4262c", "&:hover": { bgcolor: "#a4262c10" } }}>
                                            Ver {c.name.split(" ")[0]}
                                        </Button>
                                    ))}
                                </Stack>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
            )}

            {/* ── Detail Drawer ── */}
            <ClientDrawer client={selectedClient} onClose={() => setSelectedClient(null)} />
        </Box>
    );
}
