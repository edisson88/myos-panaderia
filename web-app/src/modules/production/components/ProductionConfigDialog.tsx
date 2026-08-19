// web-app/src/modules/production/components/ProductionConfigDialog.tsx

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  Divider,
  Typography,
} from '@mui/material';
import { useState, useEffect } from 'react';
import type { ProductionConfigItem } from '../production.service';

// ── Opciones predefinidas de unidad de venta ──────────────────────────────────
const SALE_UNIT_OPTIONS = [
  { value: 'bolsa',   label: 'Bolsa' },
  { value: 'unidad',  label: 'Unidad' },
  { value: 'porcion', label: 'Porción' },
  { value: 'caja',    label: 'Caja' },
  { value: 'paquete', label: 'Paquete' },
];

interface Props {
  open: boolean;
  item: ProductionConfigItem | null;
  onClose: () => void;
  onSave: (productId: string, saleUnitName: string, unitsPerTray: number, notes?: string) => Promise<void>;
  isLoading: boolean;
}

export default function ProductionConfigDialog({
  open,
  item,
  onClose,
  onSave,
  isLoading,
}: Props) {
  const [saleUnitName, setSaleUnitName] = useState('');
  const [unitsPerTray, setUnitsPerTray] = useState('');
  const [notes, setNotes] = useState('');

  // Inicializa con valores existentes al abrir
  useEffect(() => {
    if (item) {
      setSaleUnitName(item.saleUnitName ?? '');
      setUnitsPerTray(item.unitsPerTray?.toString() ?? '');
      setNotes(item.notes ?? '');
    }
  }, [item]);

  const handleSave = async () => {
    if (!item || !saleUnitName || !unitsPerTray) return;
    await onSave(
      item.productId,
      saleUnitName,
      Number(unitsPerTray),
      notes || undefined,
    );
  };

  const isValid = saleUnitName !== '' && 
                  unitsPerTray !== '' && 
                  Number(unitsPerTray) > 0;

  if (!item) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 0, boxShadow: 'none', border: '1px solid #e1dfdd' },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="subtitle1" fontWeight={700}>
          {item.hasConfig ? 'Editar configuración' : 'Configurar producción'}
        </Typography>
        <Typography variant="caption" color="#605e5c">
          {item.productName}
        </Typography>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2.5 }}>
        <Stack spacing={2.5}>

          {/* Unidad de venta */}
          <TextField
            select
            label="Unidad de venta"
            value={saleUnitName}
            onChange={(e) => setSaleUnitName(e.target.value)}
            size="small"
            fullWidth
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
            helperText="¿En qué unidad se vende este producto?"
          >
            {SALE_UNIT_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>

          {/* Unidades por lata */}
          <TextField
            label="Unidades por lata"
            type="number"
            value={unitsPerTray}
            onChange={(e) => setUnitsPerTray(e.target.value)}
            onFocus={(e) => e.target.select()}
            size="small"
            fullWidth
            inputProps={{ min: 1 }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
            helperText="¿Cuántas unidades entran en una lata?"
          />

          {/* Notas */}
          <TextField
            label="Notas (opcional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            size="small"
            fullWidth
            multiline
            rows={2}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
          />

        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={isLoading}
          variant="outlined"
          size="small"
          sx={{ borderRadius: 0, borderColor: '#e1dfdd', color: '#323130' }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          disabled={isLoading || !isValid}
          variant="contained"
          size="small"
          sx={{ borderRadius: 0, bgcolor: '#7b3c1e', '&:hover': { bgcolor: '#5c2d15' } }}
        >
          {isLoading ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}