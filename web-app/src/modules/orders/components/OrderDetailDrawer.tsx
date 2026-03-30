import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    Drawer,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { updateOrder, updateOrderStatus } from "../orders.service";
import { getProducts } from "../../products/products.service";
import type { Product } from "../../products/products.schema";
import type { OrderDetail } from "../OrdersType";

// Tipo local para items en modo edición
type EditItem = {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
};

// Opciones de estado (espejo de OrderStatus del backend)
const STATUS_OPTIONS = [
    { value: "draft",         label: "Creado" },
    { value: "confirmed",     label: "Confirmado" },
    { value: "in_production", label: "En producción" },
    { value: "delivered",     label: "Entregado" },
    { value: "with_issue",    label: "Con novedad" },
];

type Props = {
    open: boolean;
    onClose: () => void;
    order: OrderDetail | null;
    loading?: boolean;
    error?: string | null;
    onUpdated?: () => void;
    openInEditMode?: boolean;
};

function formatCurrencyCOP(value: number): string {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
    }).format(value);
}

function getStatusChipColor(status: string): "success" | "warning" | "error" | "default" {
    const s = status.toLowerCase();
    if (s === "delivered") return "success";
    if (s === "confirmed") return "success";
    if (s === "in_production") return "warning";
    if (s === "with_issue") return "error";
    return "default";
}

function getStatusLabel(value: string): string {
    return STATUS_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export default function OrderDetailDrawer({
    open,
    onClose,
    order,
    loading = false,
    error = null,
    onUpdated,
    openInEditMode = false,
}: Props) {
    const { token } = useAuth();

    // ── Modo edición ─────────────────────────────────────────────────────────
    const [editing, setEditing] = useState(false);
    const [editStatus, setEditStatus] = useState("");
    const [editDeliveryDate, setEditDeliveryDate] = useState("");
    const [editNotes, setEditNotes] = useState("");
    const [editItems, setEditItems] = useState<EditItem[]>([]);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    // ── Catálogo de productos (se carga al activar modo edición) ──────────────
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [addProduct, setAddProduct] = useState<Product | null>(null);
    const [addQty, setAddQty] = useState(1);

    // ── Confirmación de eliminación ─────────────────────────────────────
    const [confirmDeleteIdx, setConfirmDeleteIdx] = useState<number | null>(null);

    // Sincronizar campos cuando cambia el pedido
    useEffect(() => {
        if (order) {
            setEditStatus(order.status);
            setEditDeliveryDate(
                order.deliveryDate
                    ? order.deliveryDate.slice(0, 10)
                    : "",
            );
            setEditNotes(order.notes ?? "");
            setEditItems(order.items.map((i) => ({
                id: i.id,
                productId: i.productId,
                productName: i.productName,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
            })));
            setEditing(!!openInEditMode);
        } else {
            setEditing(false);
            setEditItems([]);
        }
        setSaveError(null);
        setAddProduct(null);
        setAddQty(1);
    }, [order, openInEditMode]);

    // Cargar catálogo de productos al activar edición
    useEffect(() => {
        if (editing && token && allProducts.length === 0) {
            getProducts(token)
                .then((data) => setAllProducts((data ?? []).filter((p) => p.active)))
                .catch(() => { /* no bloquear el flujo */ });
        }
    }, [editing, token, allProducts.length]);

    const handleAddProduct = () => {
        if (!addProduct || addQty < 1) return;
        const unitPrice = addProduct.unit_price ?? 0;
        setEditItems((prev) => [
            ...prev,
            {
                id: `new-${Date.now()}`,
                productId: addProduct.id!,
                productName: addProduct.name,
                quantity: addQty,
                unitPrice,
            },
        ]);
        setAddProduct(null);
        setAddQty(1);
    };

    const handleSave = async () => {
        if (!token || !order) return;
        if (editItems.length === 0) {
            setSaveError("Debe haber al menos un producto en el pedido");
            return;
        }
        setSaving(true);
        setSaveError(null);
        try {
            // 1. Actualizar status si cambió
            if (editStatus !== order.status) {
                await updateOrderStatus(order.id, editStatus, token);
            }
            // 2. Detectar cambios en campos y en items
            const notesChanged    = editNotes !== (order.notes ?? "");
            const dateChanged     = editDeliveryDate !== (order.deliveryDate?.slice(0, 10) ?? "");
            const originalItemsKey = order.items.map((i) => `${i.productId}:${i.quantity}`).join(",");
            const editItemsKey     = editItems.map((i) => `${i.productId}:${i.quantity}`).join(",");
            const itemsChanged     = editItemsKey !== originalItemsKey;

            if (notesChanged || dateChanged || itemsChanged) {
                await updateOrder(
                    order.id,
                    {
                        notes:        notesChanged ? (editNotes || undefined) : undefined,
                        deliveryDate: dateChanged  ? (editDeliveryDate || undefined) : undefined,
                        items:        itemsChanged
                            ? editItems.map((i) => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice }))
                            : undefined,
                    },
                    token,
                );
            }
            setEditing(false);
            onUpdated?.();
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : "Error al guardar");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (order) {
            setEditStatus(order.status);
            setEditDeliveryDate(order.deliveryDate?.slice(0, 10) ?? "");
            setEditNotes(order.notes ?? "");
            setEditItems(order.items.map((i) => ({
                id: i.id,
                productId: i.productId,
                productName: i.productName,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
            })));
        }
        setEditing(false);
        setSaveError(null);
        setAddProduct(null);
        setAddQty(1);
    };

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <>
            <Box
                sx={{
                    width: { xs: "100vw", sm: 540 },
                    p: 2.25,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                }}
            >
                {/* Header */}
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                            Detalle del pedido
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {order ? `${order.orderCode} · ${order.customerName}` : "Selecciona un pedido"}
                        </Typography>
                    </Box>

                    <Button
                        variant="outlined"
                        onClick={onClose}
                        sx={{ borderRadius: 0, textTransform: "none", fontWeight: 700, borderColor: "#e1dfdd", color: "#323130" }}
                    >
                        Cerrar
                    </Button>
                </Stack>

                <Divider />

                {/* Estado: cargando */}
                {loading && !order ? (
                    <Stack alignItems="center" justifyContent="center" py={6}>
                        <CircularProgress size={28} />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                            Cargando detalle…
                        </Typography>
                    </Stack>

                /* Estado: error de carga */
                ) : error && !order ? (
                    <Alert severity="error" sx={{ borderRadius: 0 }}>
                        {error}
                    </Alert>

                /* Estado: sin pedido */
                ) : !order ? (
                    <Box sx={{ p: 3, borderRadius: 0, border: "1px dashed #e1dfdd", bgcolor: "#faf9f8" }}>
                        <Typography sx={{ fontWeight: 700 }}>No hay pedido seleccionado</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Haz clic en "Ver detalle" desde la tabla.
                        </Typography>
                    </Box>

                /* Estado: pedido cargado */
                ) : (
                    <>
                        {saveError && (
                            <Alert severity="error" sx={{ borderRadius: 0 }}>
                                {saveError}
                            </Alert>
                        )}

                        {/* ── Campos editables ─────────────────────────────── */}
                        <Box sx={{ p: 2, border: "1px solid #e1dfdd", bgcolor: "#faf9f8" }}>
                            <Stack spacing={2}>
                                {/* Status */}
                                {editing ? (
                                    <FormControl size="small" fullWidth>
                                        <InputLabel sx={{ bgcolor: "#faf9f8", px: 0.5 }}>Estado</InputLabel>
                                        <Select
                                            value={editStatus}
                                            label="Estado"
                                            onChange={(e) => setEditStatus(e.target.value)}
                                            sx={{ borderRadius: 0 }}
                                        >
                                            {STATUS_OPTIONS.map((opt) => (
                                                <MenuItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                ) : (
                                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                        <Chip
                                            label={getStatusLabel(order.status)}
                                            color={getStatusChipColor(order.status)}
                                            variant="outlined"
                                            size="small"
                                            sx={{ borderRadius: 0, fontWeight: 700, fontSize: "0.65rem" }}
                                        />
                                        {order.deliveryDate && (
                                            <Chip
                                                label={`Entrega: ${order.deliveryDate.slice(0, 10)}`}
                                                variant="outlined"
                                                size="small"
                                                sx={{ borderRadius: 0, fontWeight: 700, fontSize: "0.65rem" }}
                                            />
                                        )}
                                        <Chip
                                            label={`Código: ${order.orderCode}`}
                                            variant="outlined"
                                            size="small"
                                            sx={{ borderRadius: 0, fontSize: "0.65rem" }}
                                        />
                                    </Stack>
                                )}

                                {/* Fecha de entrega */}
                                {editing && (
                                    <TextField
                                        label="Fecha de entrega"
                                        type="date"
                                        size="small"
                                        value={editDeliveryDate}
                                        onChange={(e) => setEditDeliveryDate(e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
                                    />
                                )}

                                {/* Total */}
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="body2" color="text.secondary">Total</Typography>
                                    <Typography sx={{ fontWeight: 900 }}>{formatCurrencyCOP(order.total)}</Typography>
                                </Stack>

                                {/* Notas */}
                                {editing ? (
                                    <TextField
                                        label="Notas"
                                        size="small"
                                        multiline
                                        minRows={2}
                                        value={editNotes}
                                        onChange={(e) => setEditNotes(e.target.value)}
                                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
                                    />
                                ) : order.notes ? (
                                    <>
                                        <Divider />
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 800 }}>Notas</Typography>
                                            <Typography variant="body2" color="text.secondary">{order.notes}</Typography>
                                        </Box>
                                    </>
                                ) : null}
                            </Stack>
                        </Box>

                        {/* ── Tabla de productos ───────────────────────────── */}
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                                Productos
                            </Typography>
                            <Box sx={{ overflowX: "auto" }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ "& .MuiTableCell-root": { bgcolor: "#faf9f8", fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase" } }}>
                                            <TableCell>Producto</TableCell>
                                            <TableCell>Und.</TableCell>
                                            <TableCell>V. unit.</TableCell>
                                            <TableCell>Subtotal</TableCell>
                                            {editing && <TableCell />}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {editing
                                            ? editItems.map((item, idx) => (
                                                <TableRow key={item.id}>
                                                    <TableCell sx={{ fontWeight: 700 }}>{item.productName}</TableCell>
                                                    <TableCell sx={{ minWidth: 80 }}>
                                                        <TextField
                                                            type="number"
                                                            size="small"
                                                            value={item.quantity}
                                                            inputProps={{ min: 1, step: 1 }}
                                                            onChange={(e) => {
                                                                const qty = Math.max(1, Number(e.target.value));
                                                                setEditItems((prev) =>
                                                                    prev.map((it, i) => i === idx ? { ...it, quantity: qty } : it),
                                                                );
                                                            }}
                                                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 }, width: 72 }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>{formatCurrencyCOP(item.unitPrice)}</TableCell>
                                                    <TableCell>{formatCurrencyCOP(item.quantity * item.unitPrice)}</TableCell>
                                                    <TableCell padding="none">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => setConfirmDeleteIdx(idx)}
                                                            sx={{ color: "#a4262c" }}
                                                        >
                                                            <DeleteOutlineIcon fontSize="small" />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                            : order.items.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell sx={{ fontWeight: 700 }}>{item.productName}</TableCell>
                                                    <TableCell>{item.quantity}</TableCell>
                                                    <TableCell>{formatCurrencyCOP(item.unitPrice)}</TableCell>
                                                    <TableCell>{formatCurrencyCOP(item.subtotal)}</TableCell>
                                                </TableRow>
                                            ))
                                        }
                                    </TableBody>
                                </Table>
                            </Box>

                            {/* Agregar producto (solo en modo edición) */}
                            {editing && (
                                <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mt: 1.5 }}>
                                    <Autocomplete
                                        options={allProducts}
                                        getOptionLabel={(o) => o.name}
                                        value={addProduct}
                                        onChange={(_, val) => setAddProduct(val)}
                                        size="small"
                                        sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
                                        renderInput={(params) => (
                                            <TextField {...params} label="Añadir producto" placeholder="Buscar..." />
                                        )}
                                    />
                                    <TextField
                                        type="number"
                                        size="small"
                                        label="Cant."
                                        value={addQty}
                                        inputProps={{ min: 1, step: 1 }}
                                        onChange={(e) => setAddQty(Math.max(1, Number(e.target.value)))}
                                        sx={{ width: 72, "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
                                    />
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<AddOutlinedIcon />}
                                        onClick={handleAddProduct}
                                        disabled={!addProduct}
                                        sx={{ borderRadius: 0, textTransform: "none", fontWeight: 700, borderColor: "#6B3A2A", color: "#6B3A2A", whiteSpace: "nowrap" }}
                                    >
                                        Añadir
                                    </Button>
                                </Stack>
                            )}
                        </Box>

                        {/* ── Acciones ─────────────────────────────────────── */}
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                            {editing ? (
                                <>
                                    <Button
                                        variant="outlined"
                                        onClick={handleCancel}
                                        disabled={saving}
                                        sx={{ borderRadius: 0, textTransform: "none", fontWeight: 700, borderColor: "#e1dfdd", color: "#323130" }}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={handleSave}
                                        disabled={saving}
                                        sx={{ borderRadius: 0, bgcolor: "#6B3A2A", textTransform: "none", fontWeight: 700, boxShadow: "none", "&:hover": { bgcolor: "#8b4f3d" }, minWidth: 120 }}
                                    >
                                        {saving ? <CircularProgress size={18} sx={{ color: "white" }} /> : "Guardar cambios"}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        variant="outlined"
                                        sx={{ borderRadius: 0, textTransform: "none", fontWeight: 700, borderColor: "#e1dfdd", color: "#323130" }}
                                    >
                                        Descargar PDF
                                    </Button>
                                    <Button
                                        variant="contained"
                                        startIcon={<EditOutlinedIcon />}
                                        onClick={() => setEditing(true)}
                                        sx={{ borderRadius: 0, bgcolor: "#6B3A2A", textTransform: "none", fontWeight: 700, boxShadow: "none", "&:hover": { bgcolor: "#8b4f3d" } }}
                                    >
                                        Editar pedido
                                    </Button>
                                </>
                            )}
                        </Stack>
                    </>
                )}
            </Box>

            {/* ── Diálogo confirmación de eliminación ─────────────────────── */}
            <Dialog
                open={confirmDeleteIdx !== null}
                onClose={() => setConfirmDeleteIdx(null)}
                PaperProps={{ sx: { borderRadius: 0 } }}
            >
                <DialogTitle sx={{ fontWeight: 800 }}>Eliminar producto</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {confirmDeleteIdx !== null && editItems[confirmDeleteIdx]
                            ? `¿Estás seguro de que deseas eliminar "${editItems[confirmDeleteIdx].productName}" del pedido?`
                            : "¿Estás seguro de que deseas eliminar este producto?"}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setConfirmDeleteIdx(null)}
                        sx={{ borderRadius: 0, textTransform: "none", fontWeight: 700, color: "#323130" }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            if (confirmDeleteIdx !== null) {
                                setEditItems((prev) => prev.filter((_, i) => i !== confirmDeleteIdx));
                            }
                            setConfirmDeleteIdx(null);
                        }}
                        sx={{ borderRadius: 0, textTransform: "none", fontWeight: 700, bgcolor: "#a4262c", boxShadow: "none", "&:hover": { bgcolor: "#c0392b" } }}
                    >
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>
            </>
        </Drawer>
    );
}
