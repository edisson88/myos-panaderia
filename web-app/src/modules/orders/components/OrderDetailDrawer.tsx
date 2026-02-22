import {
    Box,
    Button,
    Chip,
    Divider,
    Drawer,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import type { OrderDetail } from "../OrdersType";

type Props = {
    open: boolean;
    onClose: () => void;
    order: OrderDetail | null;
};

function formatCurrencyCOP(value: number): string {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
    }).format(value);
}

function getStatusChipColor(status: string): "success" | "warning" | "error" | "default" {
    const s = status.toLowerCase();

    if (["delivered", "entregado"].includes(s)) return "success";
    if (["confirmed", "confirmado"].includes(s)) return "success";
    if (["in_production", "en producción", "en produccion"].includes(s)) return "warning";
    if (["pending", "pendiente"].includes(s)) return "default";
    if (["cancelled", "cancelado"].includes(s)) return "error";

    return "default";
}

export default function OrderDetailDrawer({ open, onClose, order }: Props) {
    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box
                sx={{
                    width: { xs: "100vw", sm: 520 },
                    p: 2.25,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                }}
                role="presentation"
            >
                {/* Header */}
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                            Detalle del pedido
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                            {order ? `${order.orderCode} · ${order.customerName}` : "Selecciona un pedido"}
                        </Typography>
                    </Box>

                    <Button variant="outlined" onClick={onClose}>
                        Cerrar
                    </Button>
                </Stack>

                <Divider />

                {!order ? (
                    <Box
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            border: (theme) => `1px dashed ${theme.palette.divider}`,
                            bgcolor: "background.paper",
                        }}
                    >
                        <Typography sx={{ fontWeight: 700 }}>No hay pedido seleccionado</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Haz clic en “Ver detalle” desde la tabla.
                        </Typography>
                    </Box>
                ) : (
                    <>
                        {/* Summary */}
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                            <Chip
                                label={order.status}
                                color={getStatusChipColor(order.status)}
                                variant="outlined"
                                size="small"
                            />
                            {order.deliveryDate ? (
                                <Chip label={`Entrega: ${order.deliveryDate}`} variant="outlined" size="small" />
                            ) : null}
                            <Chip label={`Pedido: ${order.orderDate}`} variant="outlined" size="small" />
                        </Stack>

                        <Box
                            sx={{
                                p: 2,
                                borderRadius: 3,
                                border: (theme) => `1px solid ${theme.palette.divider}`,
                                bgcolor: "background.paper",
                            }}
                        >
                            <Stack spacing={0.75}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="body2" color="text.secondary">
                                        Total
                                    </Typography>
                                    <Typography sx={{ fontWeight: 900 }}>
                                        {formatCurrencyCOP(order.total)}
                                    </Typography>
                                </Stack>

                                {order.notes ? (
                                    <>
                                        <Divider sx={{ my: 1 }} />
                                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                            Notas
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {order.notes}
                                        </Typography>
                                    </>
                                ) : null}
                            </Stack>
                        </Box>

                        {/* Items table */}
                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
                                Productos
                            </Typography>

                            <Box sx={{ overflowX: "auto" }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Producto</TableCell>
                                            <TableCell>Unidades</TableCell>
                                            <TableCell>Valor unitario</TableCell>
                                            <TableCell>Subtotal</TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {order.items.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell sx={{ fontWeight: 700 }}>{item.productName}</TableCell>
                                                <TableCell>{item.quantity}</TableCell>
                                                <TableCell>{formatCurrencyCOP(item.unitPrice)}</TableCell>
                                                <TableCell>{formatCurrencyCOP(item.subtotal)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>
                        </Box>

                        {/* Footer actions (placeholder) */}
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button variant="outlined">Descargar PDF</Button>
                            <Button variant="contained" color="warning">
                                Editar pedido
                            </Button>
                        </Stack>
                    </>
                )}
            </Box>
        </Drawer>
    );
}