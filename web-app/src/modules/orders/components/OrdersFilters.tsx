import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import type { OrdersFilters } from "../OrdersType";

type Props = {
    value: OrdersFilters;
    onChange: (next: OrdersFilters) => void;
    onApply: () => void;
    onClear: () => void;
};

export default function OrdersFilters({ value, onChange, onApply, onClear }: Props) {
    return (
        <Box
            sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: "background.paper",
                border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
        >
            <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                alignItems={{ xs: "stretch", md: "flex-end" }}
                justifyContent="space-between"
            >
                <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                        Filtros
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Filtra el historial por rango de fechas y estado
                    </Typography>
                </Box>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="flex-end">
                    <TextField
                        label="Desde"
                        type="date"
                        size="small"
                        value={value.dateFrom ?? ""}
                        onChange={(e) => onChange({ ...value, dateFrom: e.target.value || null })}
                        InputLabelProps={{ shrink: true }}
                    />

                    <TextField
                        label="Hasta"
                        type="date"
                        size="small"
                        value={value.dateTo ?? ""}
                        onChange={(e) => onChange({ ...value, dateTo: e.target.value || null })}
                        InputLabelProps={{ shrink: true }}
                    />

                    <TextField
                        label="Estado"
                        size="small"
                        placeholder="Ej: confirmed"
                        value={value.status ?? ""}
                        onChange={(e) => onChange({ ...value, status: e.target.value || null })}
                        sx={{ minWidth: { xs: "100%", sm: 220 } }}
                    />

                    <TextField
                        label="Buscar"
                        size="small"
                        placeholder="Código o cliente"
                        value={value.search ?? ""}
                        onChange={(e) => onChange({ ...value, search: e.target.value })}
                        sx={{ minWidth: { xs: "100%", sm: 260 } }}
                    />

                    <Stack direction="row" spacing={1}>
                        <Button variant="outlined" onClick={onClear}>
                            Limpiar
                        </Button>
                        <Button variant="contained" color="warning" onClick={onApply}>
                            Aplicar
                        </Button>
                    </Stack>
                </Stack>
            </Stack>
        </Box>
    );
}