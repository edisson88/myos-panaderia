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

import type { Product } from "../modules/products/productTypes";
import ProductDialog from "../modules/products/components/ProductDialog";
import ConfirmDialog from "../components/ConfirmDialog";
import { useEntityManagement } from "../hooks/useEntityManagement";

const initialMockProducts: Product[] = [
    {
        id: "1",
        name: "Pan Campesino Grande",
        description: "Pan artesanal de 500g con masa madre y corteza crujiente.",
        unit_price: 12500,
        category: "Panadería Salada",
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: "2",
        name: "Croissant de Almendras",
        description: "Masa hojaldrada rellena de crema de almendras tostadas.",
        unit_price: 8500,
        category: "Repostería / Dulce",
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
];

export default function ProductsPage() {
    const {
        entities: products,
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
        editingEntity: editingProduct,
        handleOpenEdit,
        handleCloseDialog,
        handleSaveEntity: handleSaveProduct,
        handleDeleteEntity,
        confirmState,
        setConfirmState,
    } = useEntityManagement<Product>(
        initialMockProducts,
        (product, query) => 
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            !!product.description?.toLowerCase().includes(query.toLowerCase()) ||
            !!product.category?.toLowerCase().includes(query.toLowerCase()),
        "producto"
    );

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

            <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
                    <TextField
                        fullWidth size="small"
                        placeholder="Buscar por nombre, descripción o categoría..."
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
                                    Producto
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === "unit_price"}
                                    direction={orderBy === "unit_price" ? order : "asc"}
                                    onClick={() => handleSort("unit_price")}
                                    sx={{ fontWeight: 700 }}
                                >
                                    Precio
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === "category"}
                                    direction={orderBy === "category" ? order : "asc"}
                                    onClick={() => handleSort("category")}
                                    sx={{ fontWeight: 700 }}
                                >
                                    Categoría
                                </TableSortLabel>
                            </TableCell>
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
                        {products.map((product) => (
                            <TableRow key={product.id} hover>
                                <TableCell>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{product.name}</Typography>
                                    <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {product.description}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography sx={{ fontWeight: 700, color: "#6B3A2A" }}>
                                        $ {product.unit_price.toLocaleString("es-CO")}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={product.category || "General"} 
                                        size="small" 
                                        sx={{ borderRadius: 1.5, bgcolor: "rgba(210,180,140,0.2)", color: "#6B3A2A", fontWeight: 700, border: "1px solid #D2B48C" }} 
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={product.active ? "En Venta" : "Agotado"} 
                                        color={product.active ? "success" : "default"} 
                                        size="small" sx={{ fontWeight: 700, borderRadius: 1 }}
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                        <Tooltip title="Editar">
                                            <IconButton size="small" onClick={() => handleOpenEdit(product)}>
                                                <EditIcon fontSize="small" color="primary" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Eliminar">
                                            <IconButton size="small" onClick={() => handleDeleteEntity(product.id, "producto")}>
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

            <ProductDialog
                open={isDialogOpen}
                onClose={handleCloseDialog}
                product={editingProduct}
                onSave={handleSaveProduct}
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
