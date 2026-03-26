import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    InputAdornment,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    TablePagination,
    TextField,
    Typography,
    IconButton,
    Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useEffect, useMemo, useState } from "react";

import type { Client, CreateClientInput } from "../modules/customers/clientsTypes";
import ClientDialog from "../modules/customers/components/ClientDialog";
import ConfirmDialog from "../components/ConfirmDialog.tsx";
import { useAuth } from "../hooks/useAuth.ts";
import {
    createCustomer,
    deleteCustomer,
    getCustomers,
    updateCustomer,
} from "../modules/customers/customers.service";

type SortField = "name" | "active";

interface DeleteDialogState {
    open: boolean;
    id: string | null;
    name: string;
}

export default function ClientsPage() {
    const { token } = useAuth();

    const [customers, setCustomers] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [order, setOrder] = useState<"asc" | "desc">("asc");
    const [orderBy, setOrderBy] = useState<SortField>("name");

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Client | null>(null);

    const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
        open: false,
        id: null,
        name: "",
    });

    const loadCustomers = async () => {
        if (!token) {
            setCustomers([]);
            setLoading(false);
            setError("No hay sesión activa para consultar clientes");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await getCustomers(token);
            setCustomers(data);
        } catch (err) {
            const message = err instanceof Error ? err.message : "No se pudo cargar clientes";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadCustomers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const filteredCustomers = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) {
            return customers;
        }

        return customers.filter((customer) =>
            customer.name.toLowerCase().includes(query) ||
            customer.email.toLowerCase().includes(query) ||
            (customer.dni ?? "").toLowerCase().includes(query),
        );
    }, [customers, search]);

    const sortedCustomers = useMemo(() => {
        const sorted = [...filteredCustomers];

        sorted.sort((a, b) => {
            const aValue = a[orderBy];
            const bValue = b[orderBy];

            if (aValue < bValue) {
                return order === "asc" ? -1 : 1;
            }
            if (aValue > bValue) {
                return order === "asc" ? 1 : -1;
            }
            return 0;
        });

        return sorted;
    }, [filteredCustomers, order, orderBy]);

    const paginatedCustomers = useMemo(() => {
        const start = page * rowsPerPage;
        return sortedCustomers.slice(start, start + rowsPerPage);
    }, [sortedCustomers, page, rowsPerPage]);

    const handleSort = (field: SortField) => {
        if (orderBy === field) {
            setOrder((prev) => (prev === "asc" ? "desc" : "asc"));
            return;
        }

        setOrderBy(field);
        setOrder("asc");
    };

    const handleOpenCreate = () => {
        setEditingCustomer(null);
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (customer: Client) => {
        setEditingCustomer(customer);
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        if (!submitting) {
            setIsDialogOpen(false);
            setEditingCustomer(null);
        }
    };

    const handleSaveCustomer = async (payload: CreateClientInput) => {
        if (!token) {
            setError("No hay sesión activa para guardar clientes");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            if (editingCustomer) {
                await updateCustomer(editingCustomer.id, payload, token);
            } else {
                await createCustomer(payload, token);
            }

            setIsDialogOpen(false);
            setEditingCustomer(null);
            await loadCustomers();
        } catch (err) {
            const message = err instanceof Error ? err.message : "No se pudo guardar el cliente";
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleAskDelete = (customer: Client) => {
        setDeleteDialog({
            open: true,
            id: customer.id,
            name: customer.name,
        });
    };

    const handleConfirmDelete = async () => {
        if (!token || !deleteDialog.id) {
            setDeleteDialog({ open: false, id: null, name: "" });
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            await deleteCustomer(deleteDialog.id, token);
            setDeleteDialog({ open: false, id: null, name: "" });
            await loadCustomers();
        } catch (err) {
            const message = err instanceof Error ? err.message : "No se pudo eliminar el cliente";
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

            {error && <Alert severity="error">{error}</Alert>}

            <Card sx={{ borderRadius: 0, boxShadow: "none", border: "1px solid #e1dfdd" }}>
                <CardContent sx={{ py: 2, "&:last-child": { pb: 2 }, display: "flex", gap: 2 }}>
                    <TextField
                        fullWidth size="small"
                        placeholder="Buscar por nombre, documento o correo..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0, bgcolor: "white" } }}
                    />
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenCreate}
                        sx={{
                            borderRadius: 0,
                            bgcolor: "#6B3A2A",
                            px: 2.5,
                            whiteSpace: "nowrap",
                            textTransform: "none",
                            fontWeight: 700,
                            boxShadow: "none",
                            "&:hover": { bgcolor: "#8b4f3d" }
                        }}
                    >
                        Nuevo cliente
                    </Button>
                </CardContent>
            </Card>

            <TableContainer component={Card} sx={{ borderRadius: 0, boxShadow: "none", border: "1px solid #e1dfdd" }}>
                <Table sx={{ minWidth: 650, "& .MuiTableCell-root": { py: 1.5 } }}>
                    <TableHead sx={{ bgcolor: "#faf9f8" }}>
                        <TableRow>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === "name"}
                                    direction={orderBy === "name" ? order : "asc"}
                                    onClick={() => handleSort("name")}
                                    sx={{ fontWeight: 700 }}
                                >
                                    Nombre / Cliente
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Segmentación</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Contacto</TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === "active"}
                                    direction={orderBy === "active" ? order : "asc"}
                                    onClick={() => handleSort("active")}
                                    sx={{ fontWeight: 700 }}
                                >
                                    Estado
                                </TableSortLabel>
                            </TableCell>
                            <TableCell align="right"><Typography variant="caption" sx={{ fontWeight: 700, color: "#605e5c", textTransform: "uppercase", letterSpacing: "0.05em" }}>Acciones</Typography></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading && (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                                    <CircularProgress size={28} />
                                </TableCell>
                            </TableRow>
                        )}

                        {!loading && paginatedCustomers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                                    <Typography color="text.secondary">No se encontraron clientes</Typography>
                                </TableCell>
                            </TableRow>
                        )}

                        {!loading && paginatedCustomers.map((client) => (
                            <TableRow key={client.id} hover>
                                <TableCell>
                                    <Box>
                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{client.name}</Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                            {client.dni ? `ID: ${client.dni}` : 'Sin documento'}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">{client.email}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    {client.label ? (
                                        <Chip
                                            label={client.label}
                                            size="small"
                                            sx={{ fontSize: "0.7rem", fontWeight: 700, borderRadius: 0 }}
                                        />
                                    ) : (
                                        <Typography variant="caption" color="text.disabled">Sin etiqueta</Typography>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">{client.phone}</Typography>
                                    <Typography variant="caption" color="text.secondary">{client.address}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={client.active ? "Activo" : "Inactivo"}
                                        color={client.active ? "success" : "default"}
                                        variant={client.active ? "filled" : "outlined"}
                                        size="small" sx={{ fontWeight: 700, borderRadius: 0 }}
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                        <Tooltip title="Editar">
                                            <IconButton size="small" onClick={() => handleOpenEdit(client)}>
                                                <EditIcon fontSize="small" color="primary" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Eliminar">
                                            <IconButton
                                                size="small"
                                                disabled={submitting}
                                                onClick={() => handleAskDelete(client)}
                                            >
                                                <DeleteIcon fontSize="small" color="error" />
                                            </IconButton>
                                        </Tooltip>
                                        <IconButton size="small"><MoreVertIcon fontSize="small" /></IconButton>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={sortedCustomers.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                />
            </TableContainer>

            <ClientDialog
                open={isDialogOpen}
                onClose={handleCloseDialog}
                client={editingCustomer ?? undefined}
                onSave={handleSaveCustomer}
            />

            <ConfirmDialog
                open={deleteDialog.open}
                title="Eliminar cliente"
                message={`¿Seguro que deseas eliminar a ${deleteDialog.name}?`}
                onClose={() => setDeleteDialog({ open: false, id: null, name: "" })}
                onConfirm={handleConfirmDelete}
            />
        </Box>
    );
}
