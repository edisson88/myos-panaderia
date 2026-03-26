import { useState, Fragment, useEffect } from "react";
import { useLocation } from "react-router-dom";
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
  Collapse,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import AddIcon from "@mui/icons-material/Add";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import CancelIcon from "@mui/icons-material/Cancel";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { motion, AnimatePresence } from "framer-motion";

import type { ProductionOrder } from "../modules/production/production.schema";

const INITIAL_PRODUCTION: ProductionOrder[] = [
  {
    id: "prod-001",
    date: new Date().toISOString(),
    status: "in_progress",
    notes: "Producción de panes matutina",
    items: [
      { id: "item-1", product_id: "1", product_name: "Pan Campesino Grande", quantity_planned: 50, quantity_produced: 25 },
      { id: "item-2", product_id: "2", product_name: "Croissant de Almendras", quantity_planned: 30, quantity_produced: 0 },
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: "prod-002",
    date: new Date().toISOString(),
    status: "completed",
    notes: "Repostería tarde",
    items: [
      { id: "item-3", product_id: "2", product_name: "Croissant de Almendras", quantity_planned: 20, quantity_produced: 20 },
    ],
    created_at: new Date().toISOString(),
  },
];

const Row = ({ order, onAdvance }: { order: ProductionOrder; onAdvance: (id: string) => void }) => {
  const [open, setOpen] = useState(false);

  const statusConfig: Record<string, { label: string; color: any }> = {
    draft: { label: "Borrador", color: "default" },
    in_progress: { label: "En Progreso", color: "warning" },
    completed: { label: "Completada", color: "success" },
    cancelled: { label: "Cancelada", color: "error" },
  };

  const getStatus = (status: string) => statusConfig[status] || statusConfig["draft"];

  return (
    <Fragment>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Typography fontWeight={600}>{new Date(order.date).toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })}</Typography>
          <Typography variant="caption" color="text.secondary">{order.notes || "Sin notas"}</Typography>
        </TableCell>
        <TableCell>
          <Typography fontWeight={700} color="primary.main">{order.items.length} ítems</Typography>
        </TableCell>
        <TableCell>
          <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={order.status}
                initial={{ opacity: 0, scale: 0.8, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.2, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Chip
                  size="small"
                  label={getStatus(order.status).label}
                  color={getStatus(order.status).color}
                  icon={order.status === 'completed' ? <CheckCircleIcon /> : undefined}
                  sx={{ 
                    fontWeight: 700, 
                    borderRadius: 0,
                    transition: 'all 0.4s ease-in-out',
                    ...(order.status === 'completed' && {
                      bgcolor: '#dff6dd',
                      color: '#107c10',
                      '& .MuiChip-icon': { color: '#107c10' }
                    })
                  }}
                />
              </motion.div>
            </AnimatePresence>
            
            {/* Pequeño destello de celebración al completar */}
            {order.status === 'completed' && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [1, 1.5, 0], opacity: [0, 0.8, 0] }}
                transition={{ duration: 0.8, times: [0, 0.5, 1] }}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #107c10 0%, transparent 70%)',
                  zIndex: -1
                }}
              />
            )}
          </Box>
        </TableCell>
        <TableCell align="right">
          <IconButton 
            size="small" 
            color="primary" 
            title="Avanzar Estado" 
            onClick={() => onAdvance(order.id)}
            disabled={order.status === 'completed' || order.status === 'cancelled'}
          >
            <RocketLaunchIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" title="Cancelar" disabled={order.status === 'completed' || order.status === 'cancelled'}>
            <CancelIcon fontSize="small" />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1, p: 2, bgcolor: "#faf9f8", border: "1px solid #e1dfdd", borderRadius: 0 }}>
              <Typography variant="subtitle2" gutterBottom component="div" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Detalles del Lote <DoneAllIcon fontSize="small" color="action" />
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell><Typography variant="body2" fontWeight={600}>Producto</Typography></TableCell>
                    <TableCell align="right"><Typography variant="body2" fontWeight={600}>Cant. Planeada</Typography></TableCell>
                    <TableCell align="right"><Typography variant="body2" fontWeight={600}>Cant. Producida</Typography></TableCell>
                    <TableCell align="right"><Typography variant="body2" fontWeight={600}>Faltante</Typography></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell component="th" scope="row">
                        {item.product_name}
                      </TableCell>
                      <TableCell align="right">{item.quantity_planned}</TableCell>
                      <TableCell align="right">
                        <Typography color={item.quantity_produced === item.quantity_planned ? "success.main" : "text.secondary"} fontWeight={600}>
                          {item.quantity_produced}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {Math.max(0, item.quantity_planned - item.quantity_produced)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  );
};

export default function ProductionPage() {
  const location = useLocation();
  const [orders, setOrders] = useState<ProductionOrder[]>(INITIAL_PRODUCTION);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get("search");
    if (searchParam) {
      setSearch(searchParam);
    }
  }, [location.search]);

  const handleAdvanceStatus = (id: string) => {
    setOrders(prev => prev.map(order => 
      order.id === id 
        ? { ...order, status: order.status === 'draft' ? 'in_progress' : 'completed' } as ProductionOrder
        : order
    ));
  };

  const filteredOrders = orders.filter(
    (order) => order.notes?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

      <Card sx={{ borderRadius: 0, boxShadow: "none", border: "1px solid #e1dfdd" }}>
        <CardContent sx={{ p: 2, paddingBottom: "16px !important" }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar por notas de producción..."
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
                borderRadius: 0,
                bgcolor: "white",
                fontSize: "0.85rem",
              },
            }}
          />
        </CardContent>
      </Card>

      <TableContainer component={Card} sx={{ borderRadius: 0, boxShadow: "none", border: "1px solid #e1dfdd" }}>
        <Table aria-label="collapsible table" sx={{ minWidth: 650, "& .MuiTableCell-root": { py: 1.5 } }}>
          <TableHead sx={{ bgcolor: "#faf9f8" }}>
            <TableRow>
              <TableCell />
              <TableCell><Typography variant="subtitle2" fontWeight={700}>Fecha & Notas</Typography></TableCell>
              <TableCell><Typography variant="subtitle2" fontWeight={700}>Volumen</Typography></TableCell>
              <TableCell><Typography variant="subtitle2" fontWeight={700}>Estado</Typography></TableCell>
              <TableCell align="right"><Typography variant="subtitle2" fontWeight={700}>Acciones</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((order) => (
              <Row key={order.id} order={order} onAdvance={handleAdvanceStatus} />
            ))}
            {filteredOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">No hay órdenes de producción programadas.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredOrders.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Filas por pág:"
        />
      </TableContainer>
    </Box>
  );
}
