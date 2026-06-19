/**
 * ClientMapCard — Mapa interactivo de cobertura de clientes
 *
 * Arquitectura escalable:
 *   - Define una CityConfig con centro, zoom y lista de zonas (barrios/comunas).
 *   - Cada zona tiene coordenadas reales y clientes asociados.
 *   - Para agregar una nueva ciudad, sólo hay que añadir una entrada en CITY_CONFIGS.
 */

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from "react-leaflet";
import L from "leaflet";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Chip,
    Divider,
    Stack,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from "@mui/material";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import PeopleIcon from "@mui/icons-material/People";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import { useState } from "react";

// ── Fix Leaflet default icon path (Vite/Webpack issue) ───────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// ── Domain types ─────────────────────────────────────────────────────────────
interface ClientInfo {
    name: string;
    orders: number;
    total: number;       // COP
    status: "Activo" | "Inactivo";
    category: string;
}

interface ZonePin {
    id: string;
    label: string;       // barrio o comuna
    commune?: string;    // nombre de la comuna si el label es barrio
    lat: number;
    lng: number;
    clients: ClientInfo[];
}

interface CityConfig {
    id: string;
    name: string;
    department: string;
    center: [number, number];
    zoom: number;
    zones: ZonePin[];
}

// ── Ciudad: Ibagué ──────────────────────────────────────────────────────────
// 13 comunas oficiales + barrios representativos
// Coordenadas aproximadas basadas en geografía real de Ibagué
const IBAGUE_ZONES: ZonePin[] = [
    {
        id: "c1", label: "Comuna 1 – Norte", commune: "La Pola / Las Américas",
        lat: 4.4590, lng: -75.2250,
        clients: [
            { name: "Panadería La Pola", orders: 18, total: 1620000, status: "Activo", category: "Distribuidor" },
            { name: "Café Las Américas", orders: 8, total: 480000, status: "Activo", category: "Cafetería" },
        ],
    },
    {
        id: "c2", label: "Comuna 2 – Centro Histórico", commune: "Centro / Murillo",
        lat: 4.4450, lng: -75.2335,
        clients: [
            { name: "Hotel Lux Ibagué", orders: 32, total: 4800000, status: "Activo", category: "Hotelería" },
            { name: "Restaurante El Parque", orders: 24, total: 2160000, status: "Activo", category: "Restaurante" },
            { name: "Cafetería Central", orders: 12, total: 720000, status: "Activo", category: "Cafetería" },
        ],
    },
    {
        id: "c3", label: "Comuna 3 – Belén", commune: "Belén / Santa Bárbara",
        lat: 4.4380, lng: -75.2420,
        clients: [
            { name: "Almacén Santa Bárbara", orders: 9, total: 630000, status: "Activo", category: "Tienda" },
        ],
    },
    {
        id: "c4", label: "Comuna 4 – El Jardín", commune: "El Jardín / Piedra Pintada",
        lat: 4.4310, lng: -75.2370,
        clients: [
            { name: "Supermercado Jardín", orders: 28, total: 3360000, status: "Activo", category: "Supermercado" },
            { name: "Colegio El Jardín", orders: 5, total: 225000, status: "Inactivo", category: "Institución" },
        ],
    },
    {
        id: "c5", label: "Comuna 5 – El Salado", commune: "El Salado / Topacio",
        lat: 4.4250, lng: -75.2310,
        clients: [
            { name: "Eventos El Salado", orders: 7, total: 980000, status: "Activo", category: "Eventos" },
        ],
    },
    {
        id: "c6", label: "Comuna 6 – Calambeo", commune: "Calambeo / La Francia",
        lat: 4.4140, lng: -75.2380,
        clients: [
            { name: "Finca Calambeo", orders: 4, total: 280000, status: "Inactivo", category: "Distribución" },
        ],
    },
    {
        id: "c7", label: "Comuna 7 – Combeima", commune: "Combeima / Boquerón",
        lat: 4.4020, lng: -75.2460,
        clients: [],
    },
    {
        id: "c8", label: "Comuna 8 – El Vergel", commune: "El Vergel / La Vega",
        lat: 4.4360, lng: -75.2530,
        clients: [
            { name: "Catering El Vergel", orders: 14, total: 1540000, status: "Activo", category: "Catering" },
            { name: "Residencias La Vega", orders: 6, total: 360000, status: "Activo", category: "Hotelería" },
        ],
    },
    {
        id: "c9", label: "Comuna 9 – Calarco", commune: "Calarco / Cádiz",
        lat: 4.4490, lng: -75.2465,
        clients: [
            { name: "Club Calarco", orders: 20, total: 2800000, status: "Activo", category: "Restaurante" },
        ],
    },
    {
        id: "c10", label: "Comuna 10 – Los Tunjos", commune: "Los Tunjos / Las Margaritas",
        lat: 4.4570, lng: -75.2415,
        clients: [
            { name: "Merca Todo Los Tunjos", orders: 22, total: 2420000, status: "Activo", category: "Supermercado" },
        ],
    },
    {
        id: "c11", label: "Comuna 11 – Castilla", commune: "Castilla / Alvernia",
        lat: 4.4610, lng: -75.2340,
        clients: [
            { name: "Cafetería Castilla", orders: 11, total: 660000, status: "Activo", category: "Cafetería" },
            { name: "Panadería Alvernia", orders: 16, total: 960000, status: "Activo", category: "Distribuidor" },
        ],
    },
    {
        id: "c12", label: "Comuna 12 – El Retiro", commune: "El Retiro / Los Pinos",
        lat: 4.4530, lng: -75.2195,
        clients: [
            { name: "Urbanización Los Pinos", orders: 8, total: 680000, status: "Activo", category: "Residencial" },
        ],
    },
    {
        id: "c13", label: "Comuna 13 – Toquilla", commune: "Toquilla / La Florida",
        lat: 4.4460, lng: -75.2095,
        clients: [
            { name: "Conjunto Toquilla", orders: 5, total: 400000, status: "Inactivo", category: "Residencial" },
        ],
    },
];

// ── City registry — add future cities here ───────────────────────────────────
const CITY_CONFIGS: Record<string, CityConfig> = {
    ibague: {
        id: "ibague",
        name: "Ibagué",
        department: "Tolima",
        center: [4.4389, -75.2322],
        zoom: 13,
        zones: IBAGUE_ZONES,
    },
    // Ejemplo para escalabilidad futura:
    // bogota: { id: "bogota", name: "Bogotá", department: "Cundinamarca", center: [4.7110, -74.0721], zoom: 12, zones: [] },
    // medellin: { id: "medellin", name: "Medellín", department: "Antioquia", center: [6.2442, -75.5812], zoom: 13, zones: [] },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const circleColor = (count: number): string => {
    if (count === 0) return "#e1dfdd";
    if (count === 1) return "#f59e0b";
    if (count <= 2) return "#0078d4";
    return "#6B3A2A";
};

const fmtCOP = (v: number) => `$ ${v.toLocaleString("es-CO")}`;

// ── Fly-to helper (smooth re-center when city changes) ────────────────────────
function FlyToCity({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, zoom, { duration: 1.2 });
    }, [center, zoom, map]);
    return null;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ClientMapCard() {
    const [cityId, setCityId] = useState<string>("ibague");
    const city = CITY_CONFIGS[cityId];

    const totalClients = city.zones.reduce((a, z) => a + z.clients.length, 0);
    const activeClients = city.zones.reduce((a, z) => a + z.clients.filter(c => c.status === "Activo").length, 0);
    const totalOrders = city.zones.reduce((a, z) => a + z.clients.reduce((s, c) => s + c.orders, 0), 0);
    const totalRevenue = city.zones.reduce((a, z) => a + z.clients.reduce((s, c) => s + c.total, 0), 0);

    return (
        <Card sx={{ borderRadius: 0, boxShadow: "none", border: "1px solid #e1dfdd", bgcolor: "#ffffff" }}>
            <CardContent sx={{ p: 2.5, pb: "20px !important" }}>

                {/* ── Header ── */}
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} mb={1.5} spacing={1}>
                    <Box>
                        <Stack direction="row" spacing={0.8} alignItems="center">
                            <LocationCityIcon sx={{ fontSize: 16, color: "#6B3A2A" }} />
                            <Typography variant="caption" sx={{ color: "#323130", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                Mapa de Cobertura · {city.name}, {city.department}
                            </Typography>
                        </Stack>
                        <Typography variant="caption" sx={{ color: "#605e5c", display: "block", mt: 0.2 }}>
                            Haz clic en un marcador para ver clientes por barrio/comuna
                        </Typography>
                    </Box>

                    {/* City selector — escalable */}
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                        <InputLabel sx={{ fontSize: "0.75rem" }}>Ciudad</InputLabel>
                        <Select
                            value={cityId}
                            label="Ciudad"
                            onChange={(e) => setCityId(e.target.value)}
                            sx={{ fontSize: "0.8rem", borderRadius: 2 }}
                        >
                            {Object.values(CITY_CONFIGS).map((c) => (
                                <MenuItem key={c.id} value={c.id} sx={{ fontSize: "0.8rem" }}>
                                    {c.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Stack>

                {/* ── KPI chips ── */}
                <Stack direction="row" spacing={1} mb={1.5} flexWrap="wrap">
                    <Chip
                        icon={<PeopleIcon sx={{ fontSize: "14px !important" }} />}
                        label={`${totalClients} clientes · ${activeClients} activos`}
                        size="small"
                        sx={{ bgcolor: "#0078d415", color: "#0078d4", fontWeight: 700, fontSize: "0.7rem" }}
                    />
                    <Chip
                        icon={<ShoppingBagIcon sx={{ fontSize: "14px !important" }} />}
                        label={`${totalOrders} pedidos · ${fmtCOP(totalRevenue)}`}
                        size="small"
                        sx={{ bgcolor: "#107c1015", color: "#107c10", fontWeight: 700, fontSize: "0.7rem" }}
                    />
                    <Chip
                        label={`${city.zones.filter(z => z.clients.length > 0).length} / ${city.zones.length} comunas con clientes`}
                        size="small"
                        sx={{ bgcolor: "#6B3A2A15", color: "#6B3A2A", fontWeight: 700, fontSize: "0.7rem" }}
                    />
                </Stack>

                <Divider sx={{ mb: 1.5, borderColor: "#e1dfdd" }} />

                {/* ── Leaflet Map ── */}
                <Box
                    sx={{
                        height: 400,
                        borderRadius: 2,
                        overflow: "hidden",
                        border: "1px solid #e1dfdd",
                        "& .leaflet-container": { height: "100%", fontFamily: "inherit" },
                        "& .leaflet-popup-content-wrapper": {
                            borderRadius: "12px",
                            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                            padding: 0,
                            overflow: "hidden",
                            minWidth: 230,
                        },
                        "& .leaflet-popup-content": { margin: 0, width: "100% !important" },
                        "& .leaflet-popup-tip": { background: "white" },
                    }}
                >
                    <MapContainer
                        center={city.center}
                        zoom={city.zoom}
                        style={{ height: "100%", width: "100%" }}
                        zoomControl={true}
                        scrollWheelZoom={true}
                    >
                        <FlyToCity center={city.center} zoom={city.zoom} />

                        {/* OpenStreetMap tiles */}
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {/* Zone markers */}
                        {city.zones.map((zone) => {
                            const count = zone.clients.length;
                            const color = circleColor(count);
                            const radius = count === 0 ? 9 : count === 1 ? 13 : count <= 2 ? 16 : 20;

                            return (
                                <CircleMarker
                                    key={zone.id}
                                    center={[zone.lat, zone.lng]}
                                    radius={radius}
                                    pathOptions={{
                                        fillColor: color,
                                        color: "white",
                                        weight: 2.5,
                                        fillOpacity: count === 0 ? 0.35 : 0.85,
                                    }}
                                >
                                    <Popup maxWidth={280} minWidth={230}>
                                        <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
                                            {/* Popup header */}
                                            <div style={{
                                                background: count === 0 ? "#888" : color,
                                                padding: "10px 14px 8px",
                                                color: "white",
                                            }}>
                                                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.8 }}>
                                                    {zone.label}
                                                </div>
                                                {zone.commune && (
                                                    <div style={{ fontSize: 12, fontWeight: 600, marginTop: 2 }}>
                                                        {zone.commune}
                                                    </div>
                                                )}
                                                <div style={{ fontSize: 11, marginTop: 4, opacity: 0.85 }}>
                                                    {count === 0 ? "Sin clientes activos" : `${count} cliente${count > 1 ? "s" : ""}`}
                                                </div>
                                            </div>

                                            {/* Client list */}
                                            <div style={{ padding: "10px 14px", background: "white" }}>
                                                {count === 0 ? (
                                                    <div style={{ fontSize: 12, color: "#888", textAlign: "center", padding: "8px 0" }}>
                                                        📍 Zona sin clientes registrados
                                                    </div>
                                                ) : (
                                                    zone.clients.map((c, i) => (
                                                        <div key={i} style={{ marginBottom: i < zone.clients.length - 1 ? 10 : 0 }}>
                                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                                                <div>
                                                                    <div style={{ fontSize: 12, fontWeight: 700, color: "#323130" }}>{c.name}</div>
                                                                    <div style={{ fontSize: 10, color: "#888", marginTop: 1 }}>
                                                                        {c.category} · {c.orders} pedidos
                                                                    </div>
                                                                </div>
                                                                <span style={{
                                                                    fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 10,
                                                                    background: c.status === "Activo" ? "#107c1015" : "#f3f2f1",
                                                                    color: c.status === "Activo" ? "#107c10" : "#888",
                                                                }}>
                                                                    {c.status}
                                                                </span>
                                                            </div>
                                                            <div style={{ fontSize: 11, color: "#107c10", fontWeight: 700, marginTop: 2 }}>
                                                                {fmtCOP(c.total)}
                                                            </div>
                                                            {i < zone.clients.length - 1 && (
                                                                <div style={{ borderBottom: "1px solid #f3f2f1", marginTop: 8 }} />
                                                            )}
                                                        </div>
                                                    ))
                                                )}

                                                {/* Zone totals */}
                                                {count > 0 && (
                                                    <div style={{
                                                        marginTop: 10, paddingTop: 8,
                                                        borderTop: "1px solid #e1dfdd",
                                                        display: "flex", justifyContent: "space-between",
                                                    }}>
                                                        <span style={{ fontSize: 10, color: "#605e5c" }}>
                                                            Total zona
                                                        </span>
                                                        <span style={{ fontSize: 11, fontWeight: 700, color: "#6B3A2A" }}>
                                                            {fmtCOP(zone.clients.reduce((s, c) => s + c.total, 0))}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Popup>
                                </CircleMarker>
                            );
                        })}

                        {/* City center marker */}
                        <Marker position={city.center}>
                            <Popup>
                                <div style={{ padding: "8px 12px", fontFamily: "inherit" }}>
                                    <div style={{ fontWeight: 700, color: "#6B3A2A", fontSize: 13 }}>
                                        🏙️ {city.name}
                                    </div>
                                    <div style={{ fontSize: 11, color: "#605e5c", marginTop: 2 }}>
                                        {city.department} — Centro de operaciones Myos Panadería
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    </MapContainer>
                </Box>

                {/* ── Legend ── */}
                <Stack direction="row" spacing={2.5} mt={1.5} flexWrap="wrap" justifyContent="center">
                    {[
                        { color: "#6B3A2A", label: "≥ 3 clientes" },
                        { color: "#0078d4", label: "2 clientes" },
                        { color: "#f59e0b", label: "1 cliente" },
                        { color: "#e1dfdd", label: "Sin clientes" },
                    ].map((item) => (
                        <Stack key={item.label} direction="row" spacing={0.6} alignItems="center">
                            <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: item.color, border: "1.5px solid white", boxShadow: "0 0 0 1px #ccc" }} />
                            <Typography variant="caption" sx={{ color: "#605e5c", fontSize: "0.7rem" }}>{item.label}</Typography>
                        </Stack>
                    ))}
                </Stack>

            </CardContent>
        </Card>
    );
}
