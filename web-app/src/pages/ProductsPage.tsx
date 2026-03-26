import { useEffect, useState } from "react";
import {
  Box,
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
  TablePagination,
  TextField,
  Typography,
  IconButton,
  Button,
  Tooltip,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import type { Product, CreateProductInput } from "../modules/products/products.schema";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../modules/products/products.service";
import ProductDialog from "../modules/products/components/ProductDialog";
import ConfirmDialog from "../components/ConfirmDialog";
import { useAuth } from "../hooks/useAuth";

export default function ProductsPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const loadProducts = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getProducts(token);
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [token]);

  const handleOpenCreate = () => {
    setSelectedProduct(undefined);
    setDialogOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  const handleOpenDelete = (product: Product) => {
    setProductToDelete(product);
    setConfirmOpen(true);
  };

  const handleSave = async (data: CreateProductInput) => {
    if (!token) return;
    try {
      if (selectedProduct?.id) {
        const updated = await updateProduct(selectedProduct.id, data, token);
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      } else {
        const created = await createProduct(data, token);
        setProducts((prev) => [...prev, created]);
      }
      setDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar producto");
    }
  };

  const handleConfirmDelete = async () => {
    if (!token || !productToDelete?.id) return;
    try {
      await deleteProduct(productToDelete.id, token);
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      setConfirmOpen(false);
      setProductToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar producto");
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()),
  );

  const paginatedProducts = filteredProducts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: "Inter, sans-serif" }}>
          Productos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 700,
            px: 3,
            boxShadow: "0 4px 14px 0 rgba(0,0,0,0.1)",
          }}
        >
          Nuevo Producto
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card sx={{ borderRadius: 3, boxShadow: "0 8px 24px rgba(149,157,165,0.1)" }}>
        <CardContent sx={{ p: 2, paddingBottom: "16px !important" }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar producto por nombre o descripción..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2.5,
                bgcolor: "background.default",
              },
            }}
          />
        </CardContent>
      </Card>

      <TableContainer component={Card} sx={{ borderRadius: 3, boxShadow: "0 8px 30px rgba(0,0,0,0.04)" }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: "background.default" }}>
            <TableRow>
              <TableCell><Typography variant="subtitle2" fontWeight={700}>Producto</Typography></TableCell>
              <TableCell><Typography variant="subtitle2" fontWeight={700}>Precio (COP)</Typography></TableCell>
              <TableCell><Typography variant="subtitle2" fontWeight={700}>Estado</Typography></TableCell>
              <TableCell align="right"><Typography variant="subtitle2" fontWeight={700}>Acciones</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={32} />
                </TableCell>
              </TableRow>
            ) : paginatedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No se encontraron productos.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedProducts.map((product) => (
                <TableRow
                  key={product.id}
                  hover
                  sx={{ transition: "0.2s", "&:hover": { bgcolor: "rgba(0,0,0,0.01)" } }}
                >
                  <TableCell>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {product.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      noWrap
                      sx={{ display: "block", maxWidth: 300 }}
                    >
                      {product.description || "Sin descripción"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 700, color: "primary.main" }}>
                      $ {product.unit_price.toLocaleString("es-CO")}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={product.active ? "Activo" : "Inactivo"}
                      color={product.active ? "success" : "default"}
                      size="small"
                      sx={{ fontWeight: 700, borderRadius: 1.5 }}
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
                        <IconButton size="small" onClick={() => handleOpenDelete(product)}>
                          <DeleteIcon fontSize="small" color="error" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredProducts.length}
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
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        product={selectedProduct}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar producto"
        message={`¿Estás seguro que deseas eliminar "${productToDelete?.name}"? Esta acción no se puede deshacer.`}
        onClose={() => {
          setConfirmOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
}
