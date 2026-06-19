import {
    Alert,
    Autocomplete,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { getCustomers } from "../../customers/customers.service";
import { getProducts } from "../../products/products.service";
import { createOrder, type CreateOrderItemInput } from "../orders.service";
import type { Client } from "../../customers/clientsTypes";
import type { Product } from "../../products/products.schema";

interface Props {
    open: boolean;
    onClose: () => void;
    onCreated: () => void;
}

interface ItemRow {
    product: Product | null;
    quantity: number;
}

function formatCOP(value: number): string {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
    }).format(value);
}

export default function CreateOrderDialog({ open, onClose, onCreated }: Props) {
    const { token } = useAuth();

    // ── Datos externos ──────────────────────────────────────────────────────
    const [customers, setCustomers] = useState<Client[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingData, setLoadingData] = useState(false);

    // ── Formulario ──────────────────────────────────────────────────────────
    const [customer, setCustomer] = useState<Client | null>(null);
    const [deliveryDate, setDeliveryDate] = useState("");
    const [notes, setNotes] = useState("");
    const [items, setItems] = useState<ItemRow[]>([{ product: null, quantity: 1 }]);

    // ── Estado de envío ─────────────────────────────────────────────────────
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ── Carga clientes y productos al abrir ─────────────────────────────────
    useEffect(() => {
        if (!open || !token) return;
        setLoadingData(true);
        Promise.all([getCustomers(token), getProducts(token)])
            .then(([c, p]) => {
                setCustomers(c);
                setProducts(p.filter((pr) => pr.active !== false));
            })
            .catch(() => setError("No se pudieron cargar clientes o productos"))
            .finally(() => setLoadingData(false));
    }, [open, token]);

    // ── Reset al cerrar ─────────────────────────────────────────────────────
    const handleClose = () => {
        setCustomer(null);
        setDeliveryDate("");
        setNotes("");
        setItems([{ product: null, quantity: 1 }]);
        setError(null);
        onClose();
    };

    // ── Manejo de items ─────────────────────────────────────────────────────
    const addItem = () => setItems((prev) => [...prev, { product: null, quantity: 1 }]);

    const removeItem = (index: number) =>
        setItems((prev) => prev.filter((_, i) => i !== index));

    const updateItem = (index: number, patch: Partial<ItemRow>) =>
        setItems((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));

    // ── Totales ─────────────────────────────────────────────────────────────
    const total = items.reduce((sum, row) => {
        if (!row.product?.unit_price) return sum;
        return sum + row.quantity * row.product.unit_price;
    }, 0);

    // ── Validación básica ───────────────────────────────────────────────────
    const isValid =
        customer !== null &&
        items.length > 0 &&
        items.every((row) => row.product !== null && row.quantity > 0);

    // ── Envío ───────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!token || !customer) return;
        setSaving(true);
        setError(null);
        try {
            const orderItems: CreateOrderItemInput[] = items.map((row) => ({
                productId: row.product!.id!,
                quantity: row.quantity,
                unitPrice: row.product!.unit_price,
            }));

            await createOrder(
                {
                    customerId: customer.id,
                    orderDate: new Date().toISOString(),
                    deliveryDate: deliveryDate || undefined,
                    notes: notes || undefined,
                    items: orderItems,
                },
                token,
            );

            onCreated();
            handleClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al crear el pedido");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { borderRadius: 0 } }}
        >
            <DialogTitle sx={{ fontWeight: 900, pb: 1 }}>
                Nuevo pedido
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                    Selecciona el cliente, agrega productos y confirma
                </Typography>
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ pt: 2.5 }}>
                {loadingData ? (
                    <Stack alignItems="center" py={5}>
                        <CircularProgress size={28} />
                    </Stack>
                ) : (
                    <Stack spacing={2.5}>
                        {error && (
                            <Alert severity="error" sx={{ borderRadius: 0 }}>
                                {error}
                            </Alert>
                        )}

                        {/* Datos del pedido */}
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                            <Autocomplete
                                options={customers}
                                getOptionLabel={(c) => `${c.name} — ${c.email}`}
                                value={customer}
                                onChange={(_, val) => setCustomer(val)}
                                isOptionEqualToValue={(a, b) => a.id === b.id}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Cliente *"
                                        size="small"
                                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
                                    />
                                )}
                                sx={{ flex: 1, minWidth: 240 }}
                            />

                            <TextField
                                label="Fecha de entrega"
                                type="date"
                                size="small"
                                value={deliveryDate}
                                onChange={(e) => setDeliveryDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                sx={{ minWidth: 200, "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
                            />
                        </Stack>

                        <TextField
                            label="Notas"
                            size="small"
                            multiline
                            minRows={2}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Instrucciones de entrega, observaciones…"
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
                        />

                        <Divider />

                        {/* Tabla de productos */}
                        <Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                                    Productos *
                                </Typography>
                                <Button
                                    size="small"
                                    startIcon={<AddIcon />}
                                    onClick={addItem}
                                    sx={{ borderRadius: 0, textTransform: "none", fontWeight: 700 }}
                                >
                                    Agregar producto
                                </Button>
                            </Stack>

                            <Box sx={{ overflowX: "auto" }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow
                                            sx={{
                                                "& .MuiTableCell-root": {
                                                    bgcolor: "#faf9f8",
                                                    fontWeight: 700,
                                                    fontSize: "0.72rem",
                                                    textTransform: "uppercase",
                                                },
                                            }}
                                        >
                                            <TableCell sx={{ minWidth: 260 }}>Producto</TableCell>
                                            <TableCell sx={{ width: 120 }}>Cantidad</TableCell>
                                            <TableCell sx={{ width: 120 }}>Precio unit.</TableCell>
                                            <TableCell sx={{ width: 120 }}>Subtotal</TableCell>
                                            <TableCell sx={{ width: 48 }} />
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {items.map((row, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <Autocomplete
                                                        options={products}
                                                        getOptionLabel={(p) => p.name}
                                                        value={row.product}
                                                        onChange={(_, val) => updateItem(index, { product: val })}
                                                        isOptionEqualToValue={(a, b) => a.id === b.id}
                                                        renderInput={(params) => (
                                                            <TextField
                                                                {...params}
                                                                size="small"
                                                                placeholder="Selecciona producto"
                                                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
                                                            />
                                                        )}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        type="number"
                                                        size="small"
                                                        value={row.quantity}
                                                        onChange={(e) =>
                                                            updateItem(index, {
                                                                quantity: Math.max(1, Number(e.target.value)),
                                                            })
                                                        }
                                                        inputProps={{ min: 1 }}
                                                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {row.product ? formatCOP(row.product.unit_price) : "—"}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                        {row.product
                                                            ? formatCOP(row.quantity * row.product.unit_price)
                                                            : "—"}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => removeItem(index)}
                                                        disabled={items.length === 1}
                                                    >
                                                        <DeleteOutlineIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>

                            <Stack direction="row" justifyContent="flex-end" mt={1.5}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                                    Total: {formatCOP(total)}
                                </Typography>
                            </Stack>
                        </Box>
                    </Stack>
                )}
            </DialogContent>

            <Divider />

            <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                <Button
                    onClick={handleClose}
                    variant="outlined"
                    disabled={saving}
                    sx={{ borderRadius: 0, textTransform: "none", fontWeight: 700, borderColor: "#e1dfdd", color: "#323130" }}
                >
                    Cancelar
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={!isValid || saving}
                    sx={{
                        borderRadius: 0,
                        bgcolor: "#6B3A2A",
                        textTransform: "none",
                        fontWeight: 700,
                        boxShadow: "none",
                        "&:hover": { bgcolor: "#8b4f3d" },
                        minWidth: 140,
                    }}
                >
                    {saving ? <CircularProgress size={18} sx={{ color: "white" }} /> : "Crear pedido"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
