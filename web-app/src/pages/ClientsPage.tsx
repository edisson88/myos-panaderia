import {
    Box,
    Card,
    CardContent,
    Chip,
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
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import type { Client } from "../modules/clients/clientsTypes";
import ClientDialog from "../modules/clients/components/ClientDialog";
import ConfirmDialog from "../components/ConfirmDialog";
import { useEntityManagement } from "../hooks/useEntityManagement";

const initialMockClients: Client[] = [
    {
        id: "1",
        name: "María Cárdenas",
        dni: "1010202303",
        address: "Calle 12 # 45-67",
        phone: "310-456-7890",
        email: "maria.paula@email.com",
        active: true,
        tags: ["Frecuente", "VIP"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: "2",
        name: "Pastelería Delicias de la Abuela",
        dni: "NIT: 800.123.456-1",
        address: "Av. Santander # 10-20",
        phone: "320-123-4455",
        email: "contacto@deliciasabuela.com",
        active: true,
        tags: ["Mayorista", "Empresa"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
];

export default function ClientsPage() {
    const {
        entities: clients,
        totalCount,
        search,
        setSearch,
        page,
        setPage,
        rowsPerPage,
        setRowsPerPage,
        order,
        orderBy,
        handleSort,
        isDialogOpen,
        editingEntity: editingClient,
        handleOpenEdit,
        handleCloseDialog,
        handleSaveEntity: handleSaveClient,
        handleDeleteEntity,
        confirmState,
        setConfirmState,
    } = useEntityManagement<Client>(
        initialMockClients,
        (client, query) => 
            client.name.toLowerCase().includes(query.toLowerCase()) ||
            !!client.email?.toLowerCase().includes(query.toLowerCase()) ||
            !!client.dni?.toLowerCase().includes(query.toLowerCase()),
        "cliente"
    );

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

            <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
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
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5, bgcolor: "rgba(0,0,0,0.02)" } }}
                    />
                </CardContent>
            </Card>

            <TableContainer component={Card} sx={{ borderRadius: 3 }}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead sx={{ bgcolor: "rgba(0,0,0,0.02)" }}>
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
                            <TableCell align="right" sx={{ fontWeight: 700 }}>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {clients.map((client) => (
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
                                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                        {client.tags?.map((tag) => (
                                            <Chip key={tag} label={tag} size="small" sx={{ fontSize: "0.65rem", fontWeight: 700, borderRadius: 1 }} />
                                        ))}
                                        {(!client.tags || client.tags.length === 0) && <Typography variant="caption" color="text.disabled">Sin tags</Typography>}
                                    </Stack>
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
                                        size="small" sx={{ fontWeight: 700, borderRadius: 1 }}
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
                                            <IconButton size="small" onClick={() => handleDeleteEntity(client.id, "cliente")}>
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
                    count={totalCount}
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
                client={editingClient}
                onSave={handleSaveClient}
            />

            <ConfirmDialog
                open={confirmState.open}
                title={confirmState.title}
                message={confirmState.message}
                onClose={() => setConfirmState((prev) => ({ ...prev, open: false }))}
                onConfirm={confirmState.onConfirm}
            />
        </Box>
    );
}
