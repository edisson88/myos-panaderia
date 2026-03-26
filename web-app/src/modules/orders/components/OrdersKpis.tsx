import { Card, CardContent, Chip, Grid, Stack, Typography, Box } from "@mui/material";
import type { OrdersKpi } from "../OrdersType";

type Props = {
    kpis: OrdersKpi[];
};

export default function OrdersKpis({ kpis }: Props) {
    return (
        <Grid container spacing={2}>
            {kpis.map((kpi) => (
                <Grid size={{ xs: 12, md: 6, lg: 3 }} key={kpi.label}>
                    <Card sx={{ borderRadius: 0, boxShadow: "none", border: "1px solid #e1dfdd" }}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        {kpi.label}
                                    </Typography>

                                    <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
                                        {kpi.value}
                                    </Typography>
                                </Box>

                                {kpi.chipLabel ? (
                                    <Chip
                                        label={kpi.chipLabel}
                                        color={kpi.chipColor ?? "default"}
                                        variant="outlined"
                                        size="small"
                                        sx={{ borderRadius: 0, fontWeight: 700, fontSize: "0.65rem" }}
                                    />
                                ) : null}
                            </Stack>

                            {kpi.helper ? (
                                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                                    {kpi.helper}
                                </Typography>
                            ) : null}
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
}