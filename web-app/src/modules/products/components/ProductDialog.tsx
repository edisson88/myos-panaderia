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
    InputAdornment,
    MenuItem,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Product, CreateProductInput } from "../productTypes";

const productSchema = z.object({
    name: z.string().min(3, "Mínimo 3 caracteres"),
    description: z.string().optional(),
    unit_price: z.number({ message: "Debe ser un número" }).min(0, "Mínimo 0"),
    category: z.string().min(1, "Selecciona una categoría"),
    active: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

const PRODUCT_CATEGORIES = [
    "Panadería Salada",
    "Repostería / Dulce",
    "Bebidas Calientes",
    "Bebidas Frías",
    "Masa Madre",
    "Galletería",
];

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
    } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: "",
            description: "",
            unit_price: 0,
            category: "",
            active: true,
        },
    });

    useEffect(() => {
        if (open) {
            reset({
                name: product?.name || "",
                description: product?.description || "",
                unit_price: product?.unit_price || 0,
                category: product?.category || "",
                active: product?.active ?? true,
            });
        }
    }, [open, product, reset]);

    const onSubmit = (data: ProductFormData) => {
        onSave(data as CreateProductInput);
    };

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
                                        label="Nombre del Producto"
                                        fullWidth
                                        error={!!errors.name}
                                        helperText={errors.name?.message}
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
                                        label="Precio Unitario"
                                        type="number"
                                        fullWidth
                                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                        error={!!errors.unit_price}
                                        helperText={errors.unit_price?.message}
                                        size="small"
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                        }}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name="category"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        label="Categoría"
                                        fullWidth
                                        size="small"
                                        error={!!errors.category}
                                        helperText={errors.category?.message}
                                    >
                                        {PRODUCT_CATEGORIES.map((cat) => (
                                            <MenuItem key={cat} value={cat}>
                                                {cat}
                                            </MenuItem>
                                        ))}
                                    </TextField>
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
                                        label="Descripción"
                                        fullWidth
                                        multiline
                                        rows={3}
                                        size="small"
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name="active"
                                control={control}
                                render={({ field }) => (
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={field.value}
                                                onChange={(e) => field.onChange(e.target.checked)}
                                                color="success"
                                            />
                                        }
                                        label="Producto en Venta"
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
            
            <DialogActions sx={{ p: 2.5, pt: 1 }}>
                <Button onClick={onClose} sx={{ color: "text.secondary", fontWeight: 700 }}>
                    Cancelar
                </Button>
                <Button 
                    onClick={handleSubmit(onSubmit)} 
                    variant="contained" 
                    sx={{ 
                        bgcolor: "#6B3A2A", 
                        "&:hover": { bgcolor: "#7d4432" },
                        borderRadius: 2,
                        fontWeight: 700,
                        px: 4
                    }}
                >
                    {isEdit ? "Guardar Cambios" : "Crear Producto"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
