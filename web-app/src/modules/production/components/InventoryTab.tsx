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
  TextField,
  IconButton,
  CircularProgress,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { fetchInventory, type DashboardInventoryItem } from "../../dashboard/dashboard.service";
import { adjustAvailableQuantity } from "../../inventory/inventory.service";

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

interface InventoryRowProps {
  item: DashboardInventoryItem;
  isAdmin: boolean;
  token: string | null;
  onSaved: () => void;
}

function InventoryRow({ item, isAdmin, token, onSaved }: InventoryRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(String(item.availableQuantity));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startEditing = () => {
    setValue(String(item.availableQuantity));
    setError(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    if (!token) return;
    const parsed = Number(value);
    if (Number.isNaN(parsed) || parsed < 0) {
      setError("Cantidad inválida");
      return;
    }
    if (parsed === item.availableQuantity) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await adjustAvailableQuantity(item.id, parsed, token);
      setIsEditing(false);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error guardando");
    } finally {
      setIsSaving(false);
    }
  };

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
        {isAdmin && isEditing ? (
          <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
            <TextField
              type="number"
              size="small"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onFocus={(e) => e.target.select()}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") cancelEditing();
              }}
              autoFocus
              disabled={isSaving}
              error={!!error}
              inputProps={{ min: 0, style: { textAlign: "center", width: 60 } }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
            />
            {isSaving ? (
              <CircularProgress size={16} />
            ) : (
              <>
                <IconButton size="small" onClick={handleSave} sx={{ color: "#107c10" }}>
                  <CheckIcon sx={{ fontSize: 16 }} />
                </IconButton>
                <IconButton size="small" onClick={cancelEditing} sx={{ color: "#605e5c" }}>
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </>
            )}
          </Stack>
        ) : (
          <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
            <span>{item.availableQuantity}</span>
            {isAdmin && (
              <IconButton size="small" onClick={startEditing} sx={{ color: "#a19f9d", "&:hover": { color: "#7b3c1e" } }}>
                <EditIcon sx={{ fontSize: 14 }} />
              </IconButton>
            )}
          </Stack>
        )}
        {error && (
          <Typography variant="caption" color="#d13438" sx={{ display: "block" }}>
            {error}
          </Typography>
        )}
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
  const { token, user } = useAuth();
  const isAdmin = user?.role === "admin";
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
                <InventoryRow key={item.id} item={item} isAdmin={isAdmin} token={token} onSaved={loadInventory} />
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
