import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Select,
    Divider,
    MenuItem,
    FormControl,
    InputLabel,
} from "@mui/material";
import { useState, useEffect } from "react";
import type { DashboardOrder } from "../modules/dashboard/dashboard.service";

interface Props {
    open: boolean;
    order: DashboardOrder | null;
    onClose: () => void;
    onSave: (newStatus: string) => void;
    isLoading: boolean;

}

const STATUS_OPTIONS = [
    { value: "draft", label: "Creado" },
    { value: "confirmed", label: "Confirmado" },
    { value: "in_production", label: "En producción" },
    { value: "delivered", label: "Entregado" },
    { value: "with_issue", label: "Con novedad" },
];

export default function EditStatusDialog({
    open,
    order,
    onClose,
    onSave,
    isLoading,
}: Props) {
    const [selectedStatus, setSelectedStatus] = useState<string>("");

    useEffect(() => {
        if (order) setSelectedStatus(order.status);
    }, [order]);

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
                <Typography variant="subtitle1" fontWeight={700}>
                    Editar estado del pedido
                </Typography>
                <Typography variant="caption" color="#605e5c">
                    {order.orderCode} · {order.customerName}
                </Typography>
            </DialogTitle>

            <Divider />
            <DialogContent sx={{ pt: 2.5 }}>
                <FormControl fullWidth size="small">
                    <InputLabel>Estado</InputLabel>
                    <Select
                        value={selectedStatus}
                        label="Estado"
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        sx={{ borderRadius: 0 }}
                    >
                        {STATUS_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Typography variant="caption" color="#605e5c" mt={1.5} display="block">
                    Estado actual: <strong>{
                        STATUS_OPTIONS.find(s => s.value === order.status)?.label
                    }</strong>
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
                    onClick={() => onSave(selectedStatus)}
                    disabled={isLoading || selectedStatus === order.status}
                    variant="contained"
                    size="small"
                    sx={{ borderRadius: 0, bgcolor: "#0078d4", "&:hover": { bgcolor: "#005fa3" } }}
                >
                    {isLoading ? "Guardando..." : "Guardar cambio"}
                </Button>
            </DialogActions>
        </Dialog>
    );

}