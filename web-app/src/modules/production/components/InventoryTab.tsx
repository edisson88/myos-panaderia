import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Skeleton,
  Stack,
  Alert,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { fetchInventory, type DashboardInventoryItem } from "../../dashboard/dashboard.service";

const panel = {
  borderRadius: 0,
  boxShadow: "none",
  border: "1px solid #e1dfdd",
  bgcolor: "#ffffff",
} as const;

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Stack spacing={1} sx={{ p: 2 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} variant="rectangular" height={40} sx={{ borderRadius: 0 }} />
      ))}
    </Stack>
  );
}

function InventoryRow({ item }: { item: DashboardInventoryItem }) {
  return (
    <TableRow sx={{ bgcolor: item.belowMinimum ? "#fff4e5" : "transparent" }}>
      <TableCell sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#323130" }}>
        <Stack direction="row" alignItems="center" spacing={0.75}>
          {item.belowMinimum ? (
            <WarningAmberIcon sx={{ fontSize: 14, color: "#f59e0b" }} />
          ) : (
            <CheckCircleOutlineIcon sx={{ fontSize: 14, color: "#107c10" }} />
          )}
          <span>{item.productName}</span>
        </Stack>
      </TableCell>
      <TableCell sx={{ fontSize: "0.78rem", color: "#605e5c" }}>
        {item.saleUnitName}
      </TableCell>
      <TableCell align="center" sx={{ fontSize: "0.8rem", fontWeight: 600, color: item.belowMinimum ? "#a4262c" : "#107c10" }}>
        {item.availableQuantity}
      </TableCell>
      <TableCell align="center" sx={{ fontSize: "0.78rem", color: "#605e5c" }}>
        {item.reservedQuantity}
      </TableCell>
      <TableCell align="center" sx={{ fontSize: "0.78rem", color: "#605e5c" }}>
        {item.damagedQuantity}
      </TableCell>
      <TableCell align="center" sx={{ fontSize: "0.78rem", color: "#605e5c" }}>
        {item.minimumStock}
      </TableCell>
    </TableRow>
  );
}

export default function InventoryTab() {
  const { token } = useAuth();
  const [inventory, setInventory] = useState<DashboardInventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInventory = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchInventory(token);
      setInventory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando inventario");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadInventory();
  }, [loadInventory]);

  const belowMinimumCount = inventory.filter((i) => i.belowMinimum).length;

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Card sx={panel}>
        <CardContent sx={{ p: 2.5, pb: "20px !important" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="subtitle1" fontWeight={700} color="#323130">
                Inventario
              </Typography>
              <Typography variant="caption" color="#605e5c">
                Stock actual — se irá descontando según la lógica de producción
              </Typography>
            </Box>
            {!isLoading && belowMinimumCount > 0 && (
              <Chip
                icon={<WarningAmberIcon sx={{ fontSize: "14px !important" }} />}
                label={`${belowMinimumCount} bajo mínimo`}
                size="small"
                sx={{
                  bgcolor: "#fff4e5",
                  color: "#f59e0b",
                  fontWeight: 700,
                  fontSize: "0.65rem",
                  border: "1px solid #f59e0b40",
                  "& .MuiChip-icon": { color: "#f59e0b" },
                }}
              />
            )}
          </Stack>
        </CardContent>
      </Card>

      <TableContainer component={Card} sx={panel}>
        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : (
          <Table size="small" sx={{ "& .MuiTableCell-root": { borderBottom: "1px solid #f3f2f1" } }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "#faf9f8" }}>
                <TableCell><Typography variant="caption" fontWeight={700} color="#605e5c" sx={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>Producto</Typography></TableCell>
                <TableCell><Typography variant="caption" fontWeight={700} color="#605e5c" sx={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>Unidad</Typography></TableCell>
                <TableCell align="center"><Typography variant="caption" fontWeight={700} color="#605e5c" sx={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>Disponible</Typography></TableCell>
                <TableCell align="center"><Typography variant="caption" fontWeight={700} color="#605e5c" sx={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>Reservado</Typography></TableCell>
                <TableCell align="center"><Typography variant="caption" fontWeight={700} color="#605e5c" sx={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>Dañado</Typography></TableCell>
                <TableCell align="center"><Typography variant="caption" fontWeight={700} color="#605e5c" sx={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>Mínimo</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inventory.map((item) => (
                <InventoryRow key={item.id} item={item} />
              ))}
              {inventory.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="#605e5c">
                      Sin productos en inventario
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </Box>
  );
}
