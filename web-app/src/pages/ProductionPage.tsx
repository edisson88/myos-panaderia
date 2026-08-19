import { useState } from "react";
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
  Button,
  Chip,
  Skeleton,
  Stack,
  Alert,
  InputAdornment,
  TextField,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SettingsIcon from "@mui/icons-material/Settings";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useProduction } from "../modules/production/useProduction";
import { upsertProductionConfig, type ProductionConfigItem } from "../modules/production/production.service";
import ProductionConfigDialog from "../modules/production/components/ProductionConfigDialog";
import { useAuth } from "../hooks/useAuth";

// ── Style tokens ──────────────────────────────────────────────────────────────
const panel = {
  borderRadius: 0,
  boxShadow: "none",
  border: "1px solid #e1dfdd",
  bgcolor: "#ffffff",
} as const;

// ── Skeleton de tabla ─────────────────────────────────────────────────────────
function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Stack spacing={1} sx={{ p: 2 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} variant="rectangular" height={48} sx={{ borderRadius: 0 }} />
      ))}
    </Stack>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function ProductionPage() {
  const { token, user } = useAuth();
  const { items, isLoading, error, refresh } = useProduction();
  const isAdmin = user?.role === "admin";

  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<ProductionConfigItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ── Filtro de búsqueda ────────────────────────────────────────────────────
  const filteredItems = items.filter((item) =>
    item.productName.toLowerCase().includes(search.toLowerCase()),
  );

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleOpenDialog = (item: ProductionConfigItem) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedItem(null);
  };

  const handleSave = async (
    productId: string,
    saleUnitName: string,
    unitsPerTray: number,
    notes?: string,
  ) => {
    if (!token) return;
    setIsSaving(true);
    try {
      await upsertProductionConfig(
        { productId, saleUnitName, unitsPerTray, notes },
        token,
      );
      handleCloseDialog();
      refresh();
    } catch (err) {
      console.error("Error guardando configuración:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

      {/* ── Header con búsqueda ── */}
      <Card sx={panel}>
        <CardContent sx={{ p: 2, pb: "16px !important" }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1.5}>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} color="#323130">
                Configuración de Producción
              </Typography>
              <Typography variant="caption" color="#605e5c">
                Define cuántas unidades entran en cada lata por producto
              </Typography>
            </Box>
            <TextField
              size="small"
              placeholder="Buscar producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: "#605e5c" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                minWidth: 220,
                "& .MuiOutlinedInput-root": { borderRadius: 0, fontSize: "0.85rem" },
              }}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* ── Tabla principal ── */}
      <TableContainer component={Card} sx={panel}>
        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : (
          <Table size="small" sx={{ "& .MuiTableCell-root": { borderBottom: "1px solid #f3f2f1" } }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "#faf9f8" }}>
                <TableCell>
                  <Typography variant="caption" fontWeight={700} color="#605e5c" sx={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Producto
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" fontWeight={700} color="#605e5c" sx={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Unidad de venta
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="caption" fontWeight={700} color="#605e5c" sx={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Unidades x lata
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" fontWeight={700} color="#605e5c" sx={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Estado
                  </Typography>
                </TableCell>
                {isAdmin && (
                  <TableCell align="right">
                    <Typography variant="caption" fontWeight={700} color="#605e5c" sx={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Acción
                    </Typography>
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow
                  key={item.productId}
                  sx={{ "&:hover": { bgcolor: "#faf9f8" }, transition: "background 0.15s" }}
                >
                  {/* Producto */}
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} color="#323130">
                      {item.productName}
                    </Typography>
                  </TableCell>

                  {/* Unidad de venta */}
                  <TableCell>
                    <Typography variant="body2" color={item.saleUnitName ? "#323130" : "#a19f9d"}>
                      {item.saleUnitName ?? "—"}
                    </Typography>
                  </TableCell>

                  {/* Unidades x lata */}
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight={item.unitsPerTray ? 600 : 400} color={item.unitsPerTray ? "#323130" : "#a19f9d"}>
                      {item.unitsPerTray ?? "—"}
                    </Typography>
                  </TableCell>

                  {/* Estado config */}
                  <TableCell>
                    {item.hasConfig ? (
                      <Chip
                        icon={<CheckCircleOutlineIcon sx={{ fontSize: "14px !important" }} />}
                        label="Configurado"
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          bgcolor: "#dff6dd",
                          color: "#107c10",
                          "& .MuiChip-icon": { color: "#107c10" },
                        }}
                      />
                    ) : (
                      <Chip
                        icon={<WarningAmberIcon sx={{ fontSize: "14px !important" }} />}
                        label="Sin configurar"
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          bgcolor: "#fff4e5",
                          color: "#f59e0b",
                          "& .MuiChip-icon": { color: "#f59e0b" },
                        }}
                      />
                    )}
                  </TableCell>

                  {/* Acción — solo admin */}
                  {isAdmin && (
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant={item.hasConfig ? "outlined" : "contained"}
                        startIcon={<SettingsIcon sx={{ fontSize: "14px !important" }} />}
                        onClick={() => handleOpenDialog(item)}
                        sx={{
                          borderRadius: 0,
                          fontSize: "0.65rem",
                          py: 0.25,
                          px: 1,
                          ...(item.hasConfig
                            ? { borderColor: "#e1dfdd", color: "#605e5c" }
                            : { bgcolor: "#7b3c1e", "&:hover": { bgcolor: "#5c2d15" } }),
                        }}
                      >
                        {item.hasConfig ? "Editar" : "Configurar"}
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}

              {filteredItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 5 : 4} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="#605e5c">
                      {search ? `Sin resultados para "${search}"` : "No hay productos registrados"}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

        {/* Resumen footer */}
        {!isLoading && items.length > 0 && (
          <Box sx={{ px: 2, py: 1.5, borderTop: "1px solid #f3f2f1", bgcolor: "#faf9f8" }}>
            <Stack direction="row" spacing={2}>
              <Typography variant="caption" color="#605e5c">
                Total productos: <strong>{items.length}</strong>
              </Typography>
              <Typography variant="caption" color="#107c10">
                Configurados: <strong>{items.filter((i) => i.hasConfig).length}</strong>
              </Typography>
              <Typography variant="caption" color="#f59e0b">
                Sin configurar: <strong>{items.filter((i) => !i.hasConfig).length}</strong>
              </Typography>
            </Stack>
          </Box>
        )}
      </TableContainer>

      {/* ── Dialog ── */}
      <ProductionConfigDialog
        open={dialogOpen}
        item={selectedItem}
        onClose={handleCloseDialog}
        onSave={handleSave}
        isLoading={isSaving}
      />
    </Box>
  );
}