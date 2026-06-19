import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import type { OrderListRow } from "../OrdersType";

type Props = {
    rows: OrderListRow[];
    onViewDetail: (orderId: string) => void;
    onEdit: (orderId: string) => void;
};

function getStatusChipColor(status: string): "success" | "warning" | "error" | "default" {
    const s = status.toLowerCase();
    if (s === "delivered") return "success";
    if (s === "confirmed") return "success";
    if (s === "in_production") return "warning";
    if (s === "with_issue") return "error";
    return "default";
}

function getStatusLabel(value: string): string {
    const labels: Record<string, string> = {
        draft:         "Creado",
        confirmed:     "Confirmado",
        in_production: "En producción",
        delivered:     "Entregado",
        with_issue:    "Con novedad",
    };
    return labels[value] ?? value;
}

function formatCurrencyCOP(value: number): string {
    // MVP: formato simple. Luego si quieres, lo movemos a un util común.
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
    }).format(value);
}

export default function OrdersTable({ rows, onViewDetail, onEdit }: Props) {
    return (
        <Card sx={{ borderRadius: 0, boxShadow: "none", border: "1px solid #e1dfdd" }}>
            <CardContent sx={{ p: 0 }}>
                <Box sx={{ p: 2.5, borderBottom: "1px solid #e1dfdd" }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                        Historial de pedidos
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Consulta pedidos por fecha y revisa el detalle por productos
                    </Typography>
                </Box>

                {rows.length === 0 ? (
                    <Box
                        sx={{
                            p: 3,
                            borderRadius: 0,
                            border: "1px dashed #e1dfdd",
                            bgcolor: "#faf9f8",
                            m: 2.5
                        }}
                    >
                        <Typography sx={{ fontWeight: 700 }}>No hay pedidos para mostrar</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Ajusta los filtros o crea un nuevo pedido.
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ overflowX: "auto" }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ "& .MuiTableCell-root": { bgcolor: "#faf9f8", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" } }}>
                                    <TableCell>Código</TableCell>
                                    <TableCell>Cliente</TableCell>
                                    <TableCell>Fecha pedido</TableCell>
                                    <TableCell>Monto</TableCell>
                                    <TableCell>Estado</TableCell>
                                    <TableCell align="right">Acciones</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {rows.map((row) => (
                                    <TableRow key={row.id} hover sx={{ "& .MuiTableCell-root": { py: 1.5 } }}>
                                        <TableCell sx={{ fontWeight: 700 }}>{row.orderCode}</TableCell>
                                        <TableCell>{row.customerName}</TableCell>
                                        <TableCell>
                                            {/* MVP: muestra string. Luego puedes formatear con date-fns. */}
                                            {row.orderDate}
                                        </TableCell>
                                        <TableCell>{formatCurrencyCOP(row.total)}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={getStatusLabel(row.status)}
                                                color={getStatusChipColor(row.status)}
                                                variant="outlined"
                                                size="small"
                                                sx={{ borderRadius: 0, fontWeight: 700, fontSize: "0.65rem" }}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <Button
                                                    size="small"
                                                    variant="text"
                                                    onClick={() => onViewDetail(row.id)}
                                                    sx={{ borderRadius: 0, fontWeight: 700, textTransform: "none" }}
                                                >
                                                    Ver detalle
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="text"
                                                    onClick={() => onEdit(row.id)}
                                                    sx={{ borderRadius: 0, fontWeight: 700, textTransform: "none", color: "#6B3A2A" }}
                                                >
                                                    Editar
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="text"
                                                    sx={{ borderRadius: 0, fontWeight: 700, textTransform: "none", color: "#605e5c" }}
                                                >
                                                    PDF
                                                </Button>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}