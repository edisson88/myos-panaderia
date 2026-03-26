import { useState } from "react";
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
  TablePagination,
  TextField,
  Typography,
  IconButton,
  Button,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import type { Product } from "../modules/products/products.schema";
// import ProductDialog from "../modules/products/components/ProductDialog";
// import ConfirmDialog from "../components/ConfirmDialog";

const dummyProducts: Product[] = [
  {
    id: "1",
    name: "Pan Campesino Grande",
    description: "Pan artesanal de 500g con masa madre y corteza crujiente.",
    unit_price: 12500,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Croissant de Almendras",
    description: "Masa hojaldrada rellena de crema de almendras tostadas.",
    unit_price: 8500,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const filteredProducts = dummyProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
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

      <Card sx={{ borderRadius: 3, boxShadow: "0 8px 24px rgba(149,157,165,0.1)" }}>
        <CardContent sx={{ p: 2, paddingBottom: "16px !important" }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar producto por nombre o descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
            {filteredProducts.map((product) => (
              <TableRow key={product.id} hover sx={{ transition: "0.2s", "&:hover": { bgcolor: "rgba(0,0,0,0.01)" } }}>
                <TableCell>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{product.name}</Typography>
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', maxWidth: 300 }}>
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
                      <IconButton size="small">
                        <EditIcon fontSize="small" color="primary" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton size="small">
                        <DeleteIcon fontSize="small" color="error" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {filteredProducts.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">No se encontraron productos.</Typography>
                </TableCell>
              </TableRow>
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

      {/* Aquí iría el ProductDialog interconectado con la API más adelante */}
    </Box>
  );
}
