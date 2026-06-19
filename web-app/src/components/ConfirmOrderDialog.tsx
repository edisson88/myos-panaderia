import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Stack,
    Divider,
} from "@mui/material";

import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import type { DashboardOrder } from "../modules/dashboard/dashboard.service";

interface Props {
    open: boolean;
    order: DashboardOrder | null;
    onClose: () => void;
    onConfirm: () => void;
    isLoading: boolean;
}

function formatCOP(value: number): string {
    return `$ ${value.toLocaleString("es-CO")}`
}

export default function ConfirmOrderDialog({
    open,
    order,
    onClose,
    onConfirm,
    isLoading,
}: Props) {
    if (!order) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            slotProps={{ paper: { sx: { borderRadius: 0, boxShadow: "none", border: "1px solid #e1dfdd" } } }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <WarningAmberIcon sx={{ color: "#f59e0b" }} />
                    <Typography variant="subtitle1" fontWeight={700}>
                        Confirmar pedido
                    </Typography>
                </Stack>
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ pt: 2 }}>
                <Typography variant="body2" color="#323130" mb={2}>
                    ¿Está seguro que desea confirmar el siguiente pedido?
                    Esta acción cambiará el estado a <strong>Completado</strong>.
                </Typography>

                {/* Resumen del pedido */}
                <Stack
                    spacing={0.75}
                    sx={{ bgcolor: "#faf9f8", border: "1px solid #e1dfdd", p: 2 }}
                >
                    <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="#605e5c" fontWeight={600}>
                            Código
                        </Typography>
                        <Typography variant="caption" fontWeight={700}>
                            {order.orderCode}
                        </Typography>
                    </Stack>

                    <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="#605e5c" fontWeight={600}>
                            Cliente
                        </Typography>
                        <Typography variant="caption" fontWeight={700}>
                            {order.customerName}
                        </Typography>
                    </Stack>

                    <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="#605e5c" fontWeight={600}>
                            Productos
                        </Typography>
                        <Typography variant="caption" fontWeight={700}>
                            {order.items.length} ítem{order.items.length !== 1 ? "s" : ""}
                        </Typography>
                    </Stack>

                    <Divider sx={{ borderColor: "#e1dfdd", my: 0.5 }} />

                    <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="#605e5c" fontWeight={700}>
                            Total
                        </Typography>
                        <Typography variant="caption" fontWeight={700} color="#107c10">
                            {formatCOP(order.total)}
                        </Typography>
                    </Stack>
                </Stack>

                <Typography variant="caption" color="#a4262c" mt={1.5} display="block">
                    ⚠️ Esta acción actualizará el inventario automáticamente.
                </Typography>
            </DialogContent>

            <Divider />

            <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
                <Button
                    onClick={onClose}
                    disabled={isLoading}
                    variant="outlined"
                    size="small"
                    sx={{ borderRadius: 0, borderColor: "#e1dfdd", color: "#323130" }}
                >
                    Cancelar
                </Button>
                <Button
                    onClick={onConfirm}
                    disabled={isLoading}
                    variant="contained"
                    size="small"
                    sx={{ borderRadius: 0, bgcolor: "#107c10", "&:hover": { bgcolor: "#0b5c0b" } }}
                >
                    {isLoading ? "Confirmando..." : "Sí, confirmar"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}