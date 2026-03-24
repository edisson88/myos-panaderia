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
    Autocomplete,
    Chip,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Client, CreateClientInput } from "../clientsTypes";

const clientSchema = z.object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    dni: z.string().min(5, "El documento debe tener al menos 5 caracteres").optional().or(z.literal("")),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email("Correo electrónico inválido").optional().or(z.literal("")),
    active: z.boolean().default(true),
    tags: z.array(z.string()).default([]),
});

type ClientFormData = z.infer<typeof clientSchema>;

const AVAILABLE_TAGS = ["Mayorista", "Minorista", "Frecuente", "Nuevo", "VIP", "Empresa"];

interface ClientDialogProps {
    open: boolean;
    onClose: () => void;
    client?: Client;
    onSave: (data: CreateClientInput) => void;
}

export default function ClientDialog({ open, onClose, client, onSave }: ClientDialogProps) {
    const isEdit = !!client;

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ClientFormData>({
        resolver: zodResolver(clientSchema),
        defaultValues: {
            name: "",
            dni: "",
            address: "",
            phone: "",
            email: "",
            active: true,
            tags: [],
        },
    });

    useEffect(() => {
        if (open) {
            reset({
                name: client?.name || "",
                dni: client?.dni || "",
                address: client?.address || "",
                phone: client?.phone || "",
                email: client?.email || "",
                active: client?.active ?? true,
                tags: client?.tags || [],
            });
        }
    }, [open, client, reset]);

    const onSubmit = (data: ClientFormData) => {
        onSave(data as CreateClientInput);
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
                {isEdit ? "Actualizar Cliente" : "Nuevo Cliente"}
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
                                        label="Nombre/Razón Social"
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
                                name="dni"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="DNI / NIT"
                                        fullWidth
                                        error={!!errors.dni}
                                        helperText={errors.dni?.message}
                                        size="small"
                                    />
                                )}
                            />
                        </Grid>
                        
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name="phone"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Teléfono"
                                        fullWidth
                                        size="small"
                                        placeholder="Ej: 300 123 4567"
                                    />
                                )}
                            />
                        </Grid>
                        
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name="email"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Email"
                                        fullWidth
                                        error={!!errors.email}
                                        helperText={errors.email?.message}
                                        size="small"
                                    />
                                )}
                            />
                        </Grid>
                        
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name="address"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Dirección"
                                        fullWidth
                                        multiline
                                        rows={2}
                                        size="small"
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name="tags"
                                control={control}
                                render={({ field }) => (
                                    <Autocomplete
                                        multiple
                                        options={AVAILABLE_TAGS}
                                        value={field.value}
                                        onChange={(_, newValue) => field.onChange(newValue)}
                                        renderTags={(value: string[], getTagProps) =>
                                            value.map((option: string, index: number) => {
                                                const { key: _key, ...tagProps } = getTagProps({ index });
                                                return (
                                                    <Chip
                                                        key={option}
                                                        variant="outlined"
                                                        label={option}
                                                        {...tagProps}
                                                        size="small"
                                                        sx={{ borderRadius: 1.5, fontWeight: 600 }}
                                                    />
                                                );
                                            })
                                        }
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Etiquetas de segmentación"
                                                placeholder="Seleccionar..."
                                                size="small"
                                            />
                                        )}
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
                                        label="Estado Activo"
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
                    {isEdit ? "Guardar Cambios" : "Crear Cliente"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
