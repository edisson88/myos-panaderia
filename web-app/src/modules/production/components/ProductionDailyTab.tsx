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
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { fetchDailyProduction, type DailyProductionItem } from "../production.service";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import Button from "@mui/material/Button";

const panel = {
  borderRadius: 0,
  boxShadow: "none",
  border: "1px solid #e1dfdd",
  bgcolor: "#ffffff",
} as const;

// Agregar después de los imports en ProductionDailyTab.tsx

function generateProductionPDF(items: DailyProductionItem[]): void {
  const today = new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const totalTrays = items
    .filter((i) => i.traysNeeded !== null)
    .reduce((acc, i) => acc + (i.traysNeeded ?? 0), 0);

  const unconfigured = items.filter((i) => !i.hasConfig);
  const configured = items.filter((i) => i.hasConfig);

  const itemRows = items
    .map(
      (item) => `
      <tr class="${!item.hasConfig ? "warning-row" : ""}">
        <td>${item.productName}</td>
        <td class="center">${item.totalSaleUnits}</td>
        <td class="center">${item.saleUnitName ?? "—"}</td>
        <td class="center">${item.unitsPerSaleUnit}</td>
        <td class="center">${item.totalUnits}</td>
        <td class="center">${item.unitsPerTray ?? "—"}</td>
        <td class="center bold">
          ${item.traysNeeded !== null
          ? `${item.traysNeeded} latas`
          : "⚠ Sin config"}
        </td>
      </tr>`,
    )
    .join("");

  const warningSection = unconfigured.length > 0
    ? `<div class="warning-box">
        ⚠ ${unconfigured.length} producto(s) sin configurar:
        ${unconfigured.map((i) => i.productName).join(", ")}
       </div>`
    : "";

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Orden de Producción — ${today}</title>
  <style>
    @page { size: A4; margin: 20mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Arial, sans-serif;
      font-size: 13px;
      color: #1a1a1a;
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 16px;
      border-bottom: 2px solid #7b3c1e;
      margin-bottom: 24px;
    }
    .bakery-name {
      font-size: 22px;
      font-weight: bold;
      color: #7b3c1e;
    }
    .bakery-info {
      font-size: 11px;
      color: #555;
      line-height: 1.6;
      margin-top: 4px;
    }
    .doc-title {
      text-align: right;
    }
    .doc-title h2 {
      font-size: 18px;
      color: #7b3c1e;
      margin-bottom: 4px;
    }
    .doc-title p {
      font-size: 11px;
      color: #555;
      text-transform: capitalize;
    }

    /* Resumen ejecutivo */
    .summary {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
    }
    .summary-card {
      flex: 1;
      border: 1px solid #e0d8d0;
      padding: 12px 16px;
      text-align: center;
    }
    .summary-card .value {
      font-size: 28px;
      font-weight: bold;
      color: #7b3c1e;
      line-height: 1;
      margin-bottom: 4px;
    }
    .summary-card .label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #888;
    }

    /* Tabla */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }
    thead tr {
      background: #7b3c1e;
      color: white;
    }
    thead th {
      padding: 10px 12px;
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    thead th.center { text-align: center; }
    tbody tr { border-bottom: 1px solid #f0ece8; }
    tbody tr:nth-child(even) { background: #faf8f6; }
    tbody tr.warning-row { background: #fffbf0; }
    tbody td { padding: 10px 12px; font-size: 13px; }
    td.center { text-align: center; }
    td.bold { font-weight: 700; }

    /* Warning box */
    .warning-box {
      background: #fffbf0;
      border-left: 3px solid #f59e0b;
      padding: 10px 14px;
      font-size: 12px;
      color: #92400e;
      margin-bottom: 16px;
    }

    /* Footer */
    .footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #e0d8d0;
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #888;
    }
    .signature-line {
      border-top: 1px solid #1a1a1a;
      width: 200px;
      padding-top: 4px;
      font-size: 11px;
      color: #555;
      margin-top: 40px;
    }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <div>
      <div class="bakery-name">Panadería Myos</div>
      <div class="bakery-info">
        Mz E Cs 29 Terrazas de Santa Ana<br/>
        Ibagué · Tel: 3103355485
      </div>
    </div>
    <div class="doc-title">
      <h2>Orden de Producción</h2>
      <p>${today}</p>
    </div>
  </div>

  <!-- Resumen ejecutivo -->
  <div class="summary">
    <div class="summary-card">
      <div class="value">${items.length}</div>
      <div class="label">Productos a producir</div>
    </div>
    <div class="summary-card">
      <div class="value">${totalTrays}</div>
      <div class="label">Total latas del día</div>
    </div>
    <div class="summary-card">
      <div class="value">${configured.length}</div>
      <div class="label">Productos configurados</div>
    </div>
    <div class="summary-card">
      <div class="value" style="color: ${unconfigured.length > 0 ? "#f59e0b" : "#107c10"}">
        ${unconfigured.length}
      </div>
      <div class="label">Sin configurar</div>
    </div>
  </div>

  <!-- Advertencia si hay productos sin configurar -->
  ${warningSection}

  <!-- Tabla de producción -->
  <table>
    <thead>
      <tr>
        <th>Producto</th>
        <th class="center">Bolsas / unidades pedidas</th>
        <th class="center">Unidad</th>
        <th class="center">Und x bolsa</th>
        <th class="center">Total unidades</th>
        <th class="center">Und x lata</th>
        <th class="center">Latas a producir</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
  </table>

  <!-- Firma -->
  <div class="footer">
    <div>
      <div class="signature-line">Encargado de producción</div>
    </div>
    <div style="text-align: right;">
      <div class="signature-line">Revisado por</div>
    </div>
  </div>

</body>
</html>`;

  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
    win.close();
  }, 500);
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Stack spacing={1} sx={{ p: 2 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} variant="rectangular" height={48} sx={{ borderRadius: 0 }} />
      ))}
    </Stack>
  );
}

export default function ProductionDailyTab() {
  const { token } = useAuth();
  const [items, setItems] = useState<DailyProductionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchDailyProduction(token);
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando producción diaria");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Totales para el footer
  const totalTrays = items
    .filter((i) => i.traysNeeded !== null)
    .reduce((acc, i) => acc + (i.traysNeeded ?? 0), 0);

  const unconfigured = items.filter((i) => !i.hasConfig).length;

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

      {/* Header */}
      <Card sx={panel}>
        <CardContent sx={{ p: 2, pb: "16px !important" }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1.5}>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} color="#323130">
                Producción del día
              </Typography>
              <Typography variant="caption" color="#605e5c">
                Calculado desde los pedidos de hoy
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              {unconfigured > 0 && (
                <Chip
                  icon={<WarningAmberIcon sx={{ fontSize: "14px !important" }} />}
                  label={`${unconfigured} sin configurar`}
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
              <Button
                size="small"
                variant="outlined"
                startIcon={<PictureAsPdfIcon />}
                disabled={isLoading || items.length === 0}
                onClick={() => generateProductionPDF(items)}
                sx={{
                  borderRadius: 0,
                  fontSize: "0.72rem",
                  borderColor: "#7b3c1e",
                  color: "#7b3c1e",
                  "&:hover": { bgcolor: "#7b3c1e10" },
                }}
              >
                Exportar PDF
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Tabla */}
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
                <TableCell align="center">
                  <Typography variant="caption" fontWeight={700} color="#605e5c" sx={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Bolsas / unidades pedidas
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="caption" fontWeight={700} color="#605e5c" sx={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Unidad
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="caption" fontWeight={700} color="#605e5c" sx={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Und x bolsa
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="caption" fontWeight={700} color="#605e5c" sx={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Total unidades
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="caption" fontWeight={700} color="#605e5c" sx={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Und x lata
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="caption" fontWeight={700} color="#605e5c" sx={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Latas a producir
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow
                  key={item.productId}
                  sx={{
                    "&:hover": { bgcolor: "#faf9f8" },
                    bgcolor: !item.hasConfig ? "#fffbf5" : "transparent",
                    transition: "background 0.15s",
                  }}
                >
                  {/* Producto */}
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} color="#323130">
                      {item.productName}
                    </Typography>
                  </TableCell>

                  {/* Bolsas / unidades pedidas */}
                  <TableCell align="center">
                    <Typography variant="body2" color="#605e5c">
                      {item.totalSaleUnits}
                    </Typography>
                  </TableCell>

                  {/* Unidad de venta */}
                  <TableCell align="center">
                    <Typography variant="body2" color={item.saleUnitName ? "#323130" : "#a19f9d"}>
                      {item.saleUnitName ?? "—"}
                    </Typography>
                  </TableCell>

                  {/* Und x bolsa */}
                  <TableCell align="center">
                    <Typography variant="body2" color="#605e5c">
                      {item.unitsPerSaleUnit}
                    </Typography>
                  </TableCell>

                  {/* Total unidades */}
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight={700} color="#323130">
                      {item.totalUnits}
                    </Typography>
                  </TableCell>

                  {/* Unidades x lata */}
                  <TableCell align="center">
                    <Typography variant="body2" color={item.unitsPerTray ? "#323130" : "#a19f9d"}>
                      {item.unitsPerTray ?? "—"}
                    </Typography>
                  </TableCell>

                  {/* Latas a producir */}
                  <TableCell align="center">
                    {item.traysNeeded !== null ? (
                      <Chip
                        label={`${item.traysNeeded} latas`}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          bgcolor: "#dff6dd",
                          color: "#107c10",
                        }}
                      />
                    ) : (
                      <Chip
                        icon={<WarningAmberIcon sx={{ fontSize: "12px !important" }} />}
                        label="Sin config"
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          bgcolor: "#fff4e5",
                          color: "#f59e0b",
                          "& .MuiChip-icon": { color: "#f59e0b" },
                        }}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="#605e5c">
                      No hay pedidos registrados hoy
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

        {/* Footer con totales */}
        {!isLoading && items.length > 0 && (
          <Box sx={{ px: 2, py: 1.5, borderTop: "1px solid #f3f2f1", bgcolor: "#faf9f8" }}>
            <Stack direction="row" spacing={2}>
              <Typography variant="caption" color="#605e5c">
                Productos: <strong>{items.length}</strong>
              </Typography>
              <Typography variant="caption" color="#107c10">
                Total latas: <strong>{totalTrays}</strong>
              </Typography>
              {unconfigured > 0 && (
                <Typography variant="caption" color="#f59e0b">
                  Sin configurar: <strong>{unconfigured}</strong> → ir a pestaña Configuración
                </Typography>
              )}
            </Stack>
          </Box>
        )}
      </TableContainer>
    </Box>
  );
}