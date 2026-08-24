// web-app/src/modules/production/components/ConfirmProductionDialog.tsx

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Divider,
  Alert,
} from '@mui/material';
import { useAuth } from '../../../hooks/useAuth';
import type { DailyProductionItem } from '../production.service';
import { confirmProduction, type ConfirmProductionResult } from '../../inventory/inventory.service';

interface Props {
  open: boolean;
  items: DailyProductionItem[];
  dateFrom: string;
  dateTo: string;
  onClose: () => void;
  onConfirmed: (result: ConfirmProductionResult) => void;
}

interface Row {
  item: DailyProductionItem;
  traysProduced: number;
  surplusUnits: number;
  surplusSaleUnits: number;
}

function buildRows(items: DailyProductionItem[], trays: Record<string, string>): Row[] {
  return items
    .filter((item) => item.hasConfig && item.unitsPerTray)
    .map((item) => {
      const traysProduced = Number(trays[item.productId] ?? item.traysNeeded ?? 0);
      const producedUnits = traysProduced * (item.unitsPerTray ?? 0);
      const surplusUnits = producedUnits - item.totalUnits;
      const unitsPerSaleUnit = item.unitsPerSaleUnit || 1;
      const surplusSaleUnits = Math.floor(surplusUnits / unitsPerSaleUnit);
      return { item, traysProduced, surplusUnits, surplusSaleUnits };
    });
}

export default function ConfirmProductionDialog({
  open,
  items,
  dateFrom,
  dateTo,
  onClose,
  onConfirmed,
}: Props) {
  const { token } = useAuth();
  const [trays, setTrays] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const initial: Record<string, string> = {};
    for (const item of items) {
      if (item.hasConfig && item.traysNeeded !== null) {
        initial[item.productId] = String(item.traysNeeded);
      }
    }
    setTrays(initial);
    setError(null);
  }, [open, items]);

  const rows = buildRows(items, trays);
  const rowsWithSurplus = rows.filter((r) => r.surplusSaleUnits > 0);

  const handleTraysChange = (productId: string, value: string) => {
    setTrays((prev) => ({ ...prev, [productId]: value }));
  };

  const handleConfirm = async () => {
    if (!token) return;
    setIsSaving(true);
    setError(null);
    try {
      const result = await confirmProduction(
        {
          dateFrom,
          dateTo,
          items: rows
            .filter((r) => r.traysProduced > 0)
            .map((r) => ({ productId: r.item.productId, traysProduced: r.traysProduced })),
        },
        token,
      );
      onConfirmed(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error confirmando producción');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isSaving ? undefined : onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 0, boxShadow: 'none', border: '1px solid #e1dfdd' },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="subtitle1" fontWeight={700}>
          Confirmar producción
        </Typography>
        <Typography variant="caption" color="#605e5c">
          Ajusta las latas realmente producidas si difieren de lo sugerido. El sobrante se sumará al inventario disponible y se descargará el PDF de la orden.
        </Typography>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2.5 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer sx={{ border: '1px solid #e1dfdd' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#faf9f8' }}>
                <TableCell>
                  <Typography variant="caption" fontWeight={700} color="#605e5c" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Producto
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="caption" fontWeight={700} color="#605e5c" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Requerido
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="caption" fontWeight={700} color="#605e5c" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Latas producidas
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="caption" fontWeight={700} color="#605e5c" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Sobrante
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(({ item, surplusUnits, surplusSaleUnits }) => (
                <TableRow key={item.productId}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} color="#323130">
                      {item.productName}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" color="#605e5c">
                      {item.totalUnits} und
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      type="number"
                      size="small"
                      value={trays[item.productId] ?? ''}
                      onChange={(e) => handleTraysChange(item.productId, e.target.value)}
                      onFocus={(e) => e.target.select()}
                      inputProps={{ min: 0, style: { textAlign: 'center' } }}
                      sx={{ width: 90, '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color={surplusSaleUnits > 0 ? '#107c10' : surplusUnits < 0 ? '#d13438' : '#a19f9d'}
                    >
                      {surplusSaleUnits > 0
                        ? `${surplusSaleUnits} ${item.saleUnitName ?? 'und'}`
                        : surplusUnits < 0
                          ? `Faltan ${Math.abs(surplusUnits)} und`
                          : '—'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="caption" color="#605e5c" sx={{ display: 'block', mt: 1.5 }}>
          {rowsWithSurplus.length > 0
            ? `${rowsWithSurplus.length} producto(s) sumarán sobrante al inventario.`
            : 'Ningún producto tiene sobrante con las latas indicadas.'}
        </Typography>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={isSaving}
          variant="outlined"
          size="small"
          sx={{ borderRadius: 0, borderColor: '#e1dfdd', color: '#323130' }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={isSaving || rows.length === 0}
          variant="contained"
          size="small"
          sx={{ borderRadius: 0, bgcolor: '#7b3c1e', '&:hover': { bgcolor: '#5c2d15' } }}
        >
          {isSaving ? 'Confirmando...' : 'Confirmar y descargar PDF'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
