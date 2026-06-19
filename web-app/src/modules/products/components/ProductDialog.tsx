import { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Grid,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateProductInputSchema, type CreateProductInput, type Product } from "../products.schema";

interface ProductDialogProps {
  open: boolean;
  onClose: () => void;
  product?: Product;
  onSave: (data: CreateProductInput) => void;
}

export default function ProductDialog({ open, onClose, product, onSave }: ProductDialogProps) {
  const isEdit = !!product;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProductInput>({
    resolver: zodResolver(CreateProductInputSchema),
    defaultValues: {
      name: "",
      description: "",
      unit_price: 0,
      active: true,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: product?.name ?? "",
        description: product?.description ?? "",
        unit_price: product?.unit_price ?? 0,
        active: product?.active ?? true,
      });
    }
  }, [open, product, reset]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
    >
      <DialogTitle sx={{ fontWeight: 800, fontSize: "1.5rem" }}>
        {isEdit ? "Actualizar Producto" : "Nuevo Producto"}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nombre del producto"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    size="small"
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ""}
                    label="Descripción"
                    fullWidth
                    multiline
                    rows={3}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    size="small"
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="unit_price"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    label="Precio unitario (COP)"
                    type="number"
                    fullWidth
                    error={!!errors.unit_price}
                    helperText={errors.unit_price?.message}
                    size="small"
                    inputProps={{ min: 0 }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex", alignItems: "center" }}>
              <Controller
                name="active"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value ?? true}
                        onChange={(e) => field.onChange(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Activo"
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: "none" }}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit(onSave)}
          variant="contained"
          sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
        >
          {isEdit ? "Actualizar" : "Crear"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
