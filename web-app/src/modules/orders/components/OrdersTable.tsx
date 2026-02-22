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
};

function getStatusChipColor(status: string): "success" | "warning" | "error" | "default" {
    const s = status.toLowerCase();

    if (["delivered", "entregado"].includes(s)) return "success";
    if (["confirmed", "confirmado"].includes(s)) return "success";
    if (["in_production", "en producción", "en produccion"].includes(s)) return "warning";
    if (["pending", "pendiente"].includes(s)) return "default";
    if (["cancelled", "cancelado"].includes(s)) return "error";

    return "default";
}

function formatCurrencyCOP(value: number): string {
    // MVP: formato simple. Luego si quieres, lo movemos a un util común.
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
    }).format(value);
}

export default function OrdersTable({ rows, onViewDetail }: Props) {
    return (
        <Card>
            <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Historial de pedidos
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Consulta pedidos por fecha y revisa el detalle por productos
                </Typography>

                {rows.length === 0 ? (
                    <Box
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            border: (theme) => `1px dashed ${theme.palette.divider}`,
                            bgcolor: "background.paper",
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
                                <TableRow>
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
                                    <TableRow key={row.id} hover>
                                        <TableCell sx={{ fontWeight: 700 }}>{row.orderCode}</TableCell>
                                        <TableCell>{row.customerName}</TableCell>
                                        <TableCell>
                                            {/* MVP: muestra string. Luego puedes formatear con date-fns. */}
                                            {row.orderDate}
                                        </TableCell>
                                        <TableCell>{formatCurrencyCOP(row.total)}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={row.status}
                                                color={getStatusChipColor(row.status)}
                                                variant="outlined"
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <Button size="small" variant="text" onClick={() => onViewDetail(row.id)}>
                                                    Ver detalle
                                                </Button>
                                                {/* Placeholder futuro */}
                                                <Button size="small" variant="text">
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