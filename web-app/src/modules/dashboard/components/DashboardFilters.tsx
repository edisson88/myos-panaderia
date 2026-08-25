import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import type { DashboardFilters as DashboardFiltersType } from "../dashboard.service";

type Props = {
    value: DashboardFiltersType;
    onChange: (next: DashboardFiltersType) => void;
    onApply: () => void;
    onClear: () => void;
};

export default function DashboardFilters({ value, onChange, onApply, onClear }: Props) {
    return (
        <Box
            sx={{
                p: 2.5,
                borderRadius: 0,
                bgcolor: "white",
                border: "1px solid #e1dfdd",
                boxShadow: "none",
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
                        Filtra el resumen por rango de fechas
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
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
                    />

                    <TextField
                        label="Hasta"
                        type="date"
                        size="small"
                        value={value.dateTo ?? ""}
                        onChange={(e) => onChange({ ...value, dateTo: e.target.value || null })}
                        InputLabelProps={{ shrink: true }}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
                    />

                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="outlined"
                            onClick={onClear}
                            sx={{ borderRadius: 0, textTransform: "none", fontWeight: 700, borderColor: "#e1dfdd", color: "#323130" }}
                        >
                            Limpiar
                        </Button>
                        <Button
                            variant="contained"
                            onClick={onApply}
                            sx={{ borderRadius: 0, bgcolor: "#6B3A2A", textTransform: "none", fontWeight: 700, boxShadow: "none", "&:hover": { bgcolor: "#8b4f3d" } }}
                        >
                            Aplicar
                        </Button>
                    </Stack>
                </Stack>
            </Stack>
        </Box>
    );
}
