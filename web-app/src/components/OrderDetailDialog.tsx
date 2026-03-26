import { useRef } from "react";
import {
    Dialog,
    DialogContent,
    Box,
    Typography,
    Stack,
    Divider,
    Chip,
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import VerifiedIcon from "@mui/icons-material/Verified";
import StoreIcon from "@mui/icons-material/Store";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";

// ── Types ────────────────────────────────────────────────────────────────────
export interface OrderItem {
    description: string;
    qty: number;
    unitPrice: number;
    subtotal: number;
}

export interface OrderDetail {
    id: string;
    date: string;
    customer: string;
    address: string;
    phone: string;
    status: string;
    deliveryMethod: string;
    operator: string;
    items: OrderItem[];
    subtotal: number;
    tax: number;
    total: number;
    notes?: string;
}

interface OrderDetailDialogProps {
    open: boolean;
    order: OrderDetail | null;
    onClose: () => void;
}

// ── Status helpers ────────────────────────────────────────────────────────────
const STATUS_COLOR: Record<string, string> = {
    Confirmado: "#0078d4",
    Entregado:  "#107c10",
    Completado: "#605e5c",
    Pendiente:  "#f59e0b",
};

const fmtCOP = (v: number) => `$ ${v.toLocaleString("es-CO")}`;

// ── Print styles injected once ────────────────────────────────────────────────
const PRINT_STYLE_ID = "order-pdf-print-style";

function injectPrintStyles() {
    if (document.getElementById(PRINT_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = PRINT_STYLE_ID;
    style.innerHTML = `
        @media print {
            body > * { display: none !important; }
            #order-pdf-printable { display: block !important; }
            #order-pdf-printable {
                position: fixed;
                inset: 0;
                padding: 32px 40px;
                background: white;
                z-index: 99999;
                font-family: 'Inter', system-ui, sans-serif;
                color: #1a1a1a;
            }
        }
    `;
    document.head.appendChild(style);
}

// ── PDF Certificate (printable area) ─────────────────────────────────────────
function PrintableCertificate({ order }: { order: OrderDetail }) {
    const today = new Date().toLocaleDateString("es-CO", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
    });

    return (
        <Box
            id="order-pdf-printable"
            sx={{
                display: "none",
                position: "fixed",
                inset: 0,
                bgcolor: "white",
                zIndex: 99999,
                p: "32px 40px",
                fontFamily: "'Inter', system-ui, sans-serif",
            }}
        >
            {/* ─── Header ─── */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box>
                    <Typography sx={{ fontSize: 22, fontWeight: 800, color: "#6B3A2A", letterSpacing: "-0.5px" }}>
                        🥖 Myos Panadería
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: "#666", mt: 0.3 }}>
                        Calle 72 # 10-34, Bogotá, Colombia · Tel: +57 601 234 5678
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: "#666" }}>
                        NIT: 900.123.456-7 · contacto@myospanaderia.com
                    </Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                    <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#323130" }}>
                        CERTIFICADO DE PEDIDO Y ENTREGA
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "#666", mt: 0.5 }}>N° {order.id}</Typography>
                    <Typography sx={{ fontSize: 11, color: "#888" }}>{today}</Typography>
                </Box>
            </Stack>

            <Box sx={{ height: 3, bgcolor: "#6B3A2A", mb: 2, borderRadius: 1 }} />

            {/* ─── Order & Client Info ─── */}
            <Stack direction="row" spacing={3} mb={2}>
                <Box sx={{ flex: 1, p: 1.5, border: "1px solid #e1dfdd", borderRadius: 1 }}>
                    <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", mb: 1 }}>
                        Información del Cliente
                    </Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#323130" }}>{order.customer}</Typography>
                    <Typography sx={{ fontSize: 11, color: "#666" }}>📍 {order.address}</Typography>
                    <Typography sx={{ fontSize: 11, color: "#666" }}>📞 {order.phone}</Typography>
                </Box>
                <Box sx={{ flex: 1, p: 1.5, border: "1px solid #e1dfdd", borderRadius: 1 }}>
                    <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", mb: 1 }}>
                        Detalles del Pedido
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: "#666" }}>📅 Fecha: <b>{order.date}</b></Typography>
                    <Typography sx={{ fontSize: 11, color: "#666" }}>🚚 Entrega: <b>{order.deliveryMethod}</b></Typography>
                    <Typography sx={{ fontSize: 11, color: "#666" }}>👤 Operador: <b>{order.operator}</b></Typography>
                    <Typography sx={{ fontSize: 11, color: "#666" }}>Estado: <b style={{ color: STATUS_COLOR[order.status] ?? "#666" }}>{order.status}</b></Typography>
                </Box>
            </Stack>

            {/* ─── Items Table ─── */}
            <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", mb: 1 }}>
                Detalle de Productos
            </Typography>
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
                <thead>
                    <tr style={{ backgroundColor: "#6B3A2A" }}>
                        <th style={{ padding: "6px 10px", textAlign: "left", color: "white", fontSize: 11, fontWeight: 700 }}>Descripción</th>
                        <th style={{ padding: "6px 10px", textAlign: "center", color: "white", fontSize: 11, fontWeight: 700 }}>Cant.</th>
                        <th style={{ padding: "6px 10px", textAlign: "right", color: "white", fontSize: 11, fontWeight: 700 }}>Precio Unit.</th>
                        <th style={{ padding: "6px 10px", textAlign: "right", color: "white", fontSize: 11, fontWeight: 700 }}>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    {order.items.map((item, i) => (
                        <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#faf9f8" : "white" }}>
                            <td style={{ padding: "6px 10px", fontSize: 12, color: "#323130" }}>{item.description}</td>
                            <td style={{ padding: "6px 10px", fontSize: 12, color: "#323130", textAlign: "center" }}>{item.qty}</td>
                            <td style={{ padding: "6px 10px", fontSize: 12, color: "#323130", textAlign: "right" }}>{fmtCOP(item.unitPrice)}</td>
                            <td style={{ padding: "6px 10px", fontSize: 12, color: "#323130", textAlign: "right", fontWeight: 600 }}>{fmtCOP(item.subtotal)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* ─── Totals ─── */}
            <Stack direction="row" justifyContent="flex-end" mb={2}>
                <Box sx={{ minWidth: 200, border: "1px solid #e1dfdd", borderRadius: 1, overflow: "hidden" }}>
                    <Stack direction="row" justifyContent="space-between" sx={{ px: 2, py: 0.8, bgcolor: "#faf9f8" }}>
                        <Typography sx={{ fontSize: 11, color: "#666" }}>Subtotal</Typography>
                        <Typography sx={{ fontSize: 11, color: "#323130", fontWeight: 600 }}>{fmtCOP(order.subtotal)}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" sx={{ px: 2, py: 0.8 }}>
                        <Typography sx={{ fontSize: 11, color: "#666" }}>IVA (19%)</Typography>
                        <Typography sx={{ fontSize: 11, color: "#323130", fontWeight: 600 }}>{fmtCOP(order.tax)}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" sx={{ px: 2, py: 1, bgcolor: "#6B3A2A" }}>
                        <Typography sx={{ fontSize: 13, color: "white", fontWeight: 700 }}>TOTAL COP</Typography>
                        <Typography sx={{ fontSize: 13, color: "white", fontWeight: 700 }}>{fmtCOP(order.total)}</Typography>
                    </Stack>
                </Box>
            </Stack>

            {/* ─── Notes ─── */}
            {order.notes && (
                <Box sx={{ p: 1.5, bgcolor: "#faf9f8", border: "1px solid #e1dfdd", borderRadius: 1, mb: 2 }}>
                    <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.5 }}>
                        Observaciones
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: "#666" }}>{order.notes}</Typography>
                </Box>
            )}

            {/* ─── Signatures ─── */}
            <Stack direction="row" spacing={4} mt={3}>
                <Box sx={{ flex: 1, textAlign: "center" }}>
                    <Box sx={{ height: 40, borderBottom: "1px solid #323130", mb: 0.5 }} />
                    <Typography sx={{ fontSize: 10, color: "#888" }}>Firma Responsable · Myos Panadería</Typography>
                </Box>
                <Box sx={{ flex: 1, textAlign: "center" }}>
                    <Box sx={{ height: 40, borderBottom: "1px solid #323130", mb: 0.5 }} />
                    <Typography sx={{ fontSize: 10, color: "#888" }}>Firma de Recibido · {order.customer}</Typography>
                </Box>
            </Stack>

            {/* ─── Footer ─── */}
            <Box sx={{ mt: 3, pt: 1.5, borderTop: "1px solid #e1dfdd", textAlign: "center" }}>
                <Typography sx={{ fontSize: 9, color: "#aaa" }}>
                    Este documento es un certificado oficial de pedido y entrega de Myos Panadería · Generado el {new Date().toLocaleString("es-CO")} · myospanaderia.com
                </Typography>
            </Box>
        </Box>
    );
}

// ── Main Dialog ───────────────────────────────────────────────────────────────
export default function OrderDetailDialog({ open, order, onClose }: OrderDetailDialogProps) {
    const printRef = useRef<HTMLDivElement>(null);

    if (!order) return null;

    const handleExportPDF = () => {
        injectPrintStyles();
        // Make printable area visible
        const el = document.getElementById("order-pdf-printable");
        if (el) el.style.display = "block";
        window.print();
        // Hide again after print dialog closes
        setTimeout(() => {
            if (el) el.style.display = "none";
        }, 1000);
    };

    const statusClr = STATUS_COLOR[order.status] ?? "#605e5c";

    return (
        <>
            {/* Hidden printable certificate */}
            <div ref={printRef}>
                <PrintableCertificate order={order} />
            </div>

            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        overflow: "hidden",
                        boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
                    },
                }}
            >
                {/* ── Dialog Header ── */}
                <Box
                    sx={{
                        background: "linear-gradient(135deg, #6B3A2A 0%, #8b4f3d 100%)",
                        px: 3,
                        pt: 2.5,
                        pb: 2,
                        position: "relative",
                    }}
                >
                    <IconButton
                        onClick={onClose}
                        size="small"
                        sx={{ position: "absolute", top: 10, right: 10, color: "rgba(255,255,255,0.7)", "&:hover": { color: "white", bgcolor: "rgba(255,255,255,0.1)" } }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>

                    <Stack direction="row" alignItems="center" spacing={1.5} mb={0.5}>
                        <StoreIcon sx={{ color: "rgba(255,255,255,0.85)", fontSize: 20 }} />
                        <Typography sx={{ color: "rgba(255,255,255,0.75)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                            Certificado de Pedido y Entrega
                        </Typography>
                    </Stack>

                    <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
                        <Box>
                            <Typography sx={{ color: "white", fontSize: "1.3rem", fontWeight: 800, lineHeight: 1.1 }}>
                                {order.customer}
                            </Typography>
                            <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: "0.75rem", mt: 0.3 }}>
                                N° {order.id}
                            </Typography>
                        </Box>
                        <Chip
                            label={order.status}
                            size="small"
                            icon={<VerifiedIcon sx={{ fontSize: "14px !important", color: "white !important" }} />}
                            sx={{
                                bgcolor: "rgba(255,255,255,0.18)",
                                color: "white",
                                fontWeight: 700,
                                fontSize: "0.7rem",
                                backdropFilter: "blur(6px)",
                            }}
                        />
                    </Stack>
                </Box>

                <DialogContent sx={{ p: 0 }}>
                    <Box sx={{ px: 3, py: 2 }}>

                        {/* ── Meta info row ── */}
                        <Stack direction="row" spacing={2} mb={2} flexWrap="wrap">
                            <Stack direction="row" spacing={0.7} alignItems="center">
                                <AccessTimeIcon sx={{ fontSize: 14, color: "#605e5c" }} />
                                <Typography variant="caption" sx={{ color: "#605e5c" }}>{order.date}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={0.7} alignItems="center">
                                <LocalShippingIcon sx={{ fontSize: 14, color: "#605e5c" }} />
                                <Typography variant="caption" sx={{ color: "#605e5c" }}>{order.deliveryMethod}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={0.7} alignItems="center">
                                <PersonIcon sx={{ fontSize: 14, color: "#605e5c" }} />
                                <Typography variant="caption" sx={{ color: "#605e5c" }}>Op: {order.operator}</Typography>
                            </Stack>
                        </Stack>

                        {/* ── Client card ── */}
                        <Box sx={{ bgcolor: "#faf9f8", border: "1px solid #e1dfdd", borderRadius: 2, px: 2, py: 1.5, mb: 2 }}>
                            <Typography variant="caption" sx={{ color: "#888", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", mb: 0.5 }}>
                                Cliente
                            </Typography>
                            <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#323130" }}>{order.customer}</Typography>
                            <Typography variant="caption" sx={{ color: "#605e5c", display: "block" }}>📍 {order.address}</Typography>
                            <Typography variant="caption" sx={{ color: "#605e5c" }}>📞 {order.phone}</Typography>
                        </Box>

                        {/* ── Items table ── */}
                        <Typography variant="caption" sx={{ color: "#888", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", mb: 1 }}>
                            Detalle de Productos
                        </Typography>
                        <Table
                            size="small"
                            sx={{
                                mb: 2,
                                "& .MuiTableCell-root": { borderBottom: "1px solid #f3f2f1", py: 1, px: 1.2, fontSize: "0.82rem" },
                            }}
                        >
                            <TableHead>
                                <TableRow sx={{ bgcolor: "#faf9f8" }}>
                                    <TableCell sx={{ fontWeight: 700, color: "#605e5c", fontSize: "0.72rem !important", textTransform: "uppercase", letterSpacing: "0.05em" }}>Producto</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 700, color: "#605e5c", fontSize: "0.72rem !important", textTransform: "uppercase" }}>Cant.</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, color: "#605e5c", fontSize: "0.72rem !important", textTransform: "uppercase" }}>P. Unit.</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, color: "#605e5c", fontSize: "0.72rem !important", textTransform: "uppercase" }}>Total</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {order.items.map((item, i) => (
                                    <TableRow key={i} sx={{ "&:hover": { bgcolor: "#f8f8f8" } }}>
                                        <TableCell sx={{ color: "#323130" }}>{item.description}</TableCell>
                                        <TableCell align="center" sx={{ color: "#605e5c" }}>{item.qty}</TableCell>
                                        <TableCell align="right" sx={{ color: "#605e5c" }}>{fmtCOP(item.unitPrice)}</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, color: "#323130" }}>{fmtCOP(item.subtotal)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {/* ── Totals ── */}
                        <Box sx={{ border: "1px solid #e1dfdd", borderRadius: 2, overflow: "hidden", mb: 2 }}>
                            <Stack direction="row" justifyContent="space-between" sx={{ px: 2, py: 1, bgcolor: "#faf9f8" }}>
                                <Typography variant="caption" sx={{ color: "#605e5c" }}>Subtotal</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 600, color: "#323130" }}>{fmtCOP(order.subtotal)}</Typography>
                            </Stack>
                            <Divider sx={{ borderColor: "#f3f2f1" }} />
                            <Stack direction="row" justifyContent="space-between" sx={{ px: 2, py: 1 }}>
                                <Typography variant="caption" sx={{ color: "#605e5c" }}>IVA (19%)</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 600, color: "#323130" }}>{fmtCOP(order.tax)}</Typography>
                            </Stack>
                            <Divider sx={{ borderColor: "#f3f2f1" }} />
                            <Stack direction="row" justifyContent="space-between" sx={{ px: 2, py: 1.2, bgcolor: "#6B3A2A" }}>
                                <Typography sx={{ color: "white", fontWeight: 700, fontSize: "0.85rem" }}>TOTAL COP</Typography>
                                <Typography sx={{ color: "white", fontWeight: 800, fontSize: "0.9rem" }}>{fmtCOP(order.total)}</Typography>
                            </Stack>
                        </Box>

                        {/* ── Notes ── */}
                        {order.notes && (
                            <Box sx={{ bgcolor: "#fff8f0", border: "1px solid #f59e0b40", borderRadius: 2, px: 2, py: 1.5, mb: 2 }}>
                                <Typography variant="caption" sx={{ color: "#b45309", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", mb: 0.3 }}>
                                    Observaciones
                                </Typography>
                                <Typography variant="caption" sx={{ color: "#605e5c" }}>{order.notes}</Typography>
                            </Box>
                        )}

                        {/* ── Status badge ── */}
                        <Stack direction="row" spacing={1} alignItems="center" mb={2.5}>
                            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: statusClr, flexShrink: 0 }} />
                            <Typography variant="caption" sx={{ color: "#605e5c" }}>
                                Estado del pedido: <strong style={{ color: statusClr }}>{order.status}</strong>
                            </Typography>
                        </Stack>
                    </Box>

                    {/* ── Footer actions ── */}
                    <Box
                        sx={{
                            px: 3,
                            py: 2,
                            borderTop: "1px solid #e1dfdd",
                            bgcolor: "#faf9f8",
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 1.5,
                        }}
                    >
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={onClose}
                            sx={{
                                textTransform: "none",
                                borderRadius: 2,
                                borderColor: "#e1dfdd",
                                color: "#605e5c",
                                fontWeight: 600,
                                px: 2,
                            }}
                        >
                            Cerrar
                        </Button>
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<PictureAsPdfIcon />}
                            onClick={handleExportPDF}
                            sx={{
                                textTransform: "none",
                                borderRadius: 2,
                                bgcolor: "#6B3A2A",
                                "&:hover": { bgcolor: "#8b4f3d" },
                                fontWeight: 700,
                                px: 2.5,
                                boxShadow: "0 2px 12px rgba(107,58,42,0.35)",
                            }}
                        >
                            Exportar PDF
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
}
