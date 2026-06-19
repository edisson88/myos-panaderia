import React, { useState } from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Button,
    Stack,
    Divider,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Alert,
    LinearProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DownloadIcon from "@mui/icons-material/Download";
import PeopleIcon from "@mui/icons-material/People";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import * as XLSX from 'xlsx';

// --- Tipos ---
type ImportEntity = "clientes" | "productos" | "proveedores" | "pedidos";

// --- Mock Data para Previsualización ---
const MOCK_PREVIEW: Record<ImportEntity, any[]> = {
    clientes: [
        { dni: "1.025.432.111", nombre: "Hotel Tequendama", email: "compras@tequendama.com", telefono: "3101234567", ciudad: "Ibagué", status: "Valido" },
        { dni: "900.234.567-8", nombre: "Restaurante El Cohete", email: "elcohete@mail.com", telefono: "3007654321", ciudad: "Ibagué", status: "Valido" },
        { dni: "800.111.000-2", nombre: "Panificadora Central", email: "pan@central.co", telefono: "invalid_phone", ciudad: "Espinal", status: "Error" },
    ],
    productos: [
        { nombre: "Pan Artesanal", sku: "PAN-001", precio: 2500, stock: 100, status: "Valido" },
        { nombre: "Baguette", sku: "PAN-002", precio: 3000, stock: 50, status: "Valido" },
    ],
    proveedores: [
        { nombre: "Molinos del Tolima", nit: "800.123.456-1", contacto: "Roberto Gómez", status: "Valido" },
    ],
    pedidos: [
        { id: "PED-100", cliente: "Hotel Tequendama", fecha: "2024-03-25", total: 150000, status: "Valido" },
    ],
};

const ENTITY_CONFIG: Record<ImportEntity, { label: string; icon: React.ReactElement; color: string }> = {
    clientes: { label: "Clientes", icon: <PeopleIcon />, color: "#0078d4" },
    productos: { label: "Productos", icon: <ShoppingBagIcon />, color: "#107c10" },
    proveedores: { label: "Proveedores", icon: <LocalShippingIcon />, color: "#f59e0b" },
    pedidos: { label: "Pedidos", icon: <ReceiptLongIcon />, color: "#6B3A2A" },
};

const TEMPLATE_HEADERS: Record<ImportEntity, string[]> = {
    clientes: ["DNI", "Nombre", "Categoria", "Email", "Telefono", "Direccion", "Comuna", "NPS"],
    productos: ["SKU", "Nombre", "Categoria", "Precio", "Unidad_Medida", "Stock_Minimo"],
    proveedores: ["NIT", "Nombre_Empresa", "Contacto", "Email", "Telefono"],
    pedidos: ["ID_Pedido", "ID_Cliente", "Fecha", "Total_COP", "Estado"],
};

const SAMPLE_DATA: Record<ImportEntity, any[]> = {
    clientes: [{ DNI: "900.123.456-7", Nombre: "Empresa Ejemplo", Categoria: "Restaurante", Email: "ejemplo@mail.com", Telefono: "3001234567", Direccion: "Calle 1 \# 2-3", Comuna: "Comuna 1", NPS: 9 }],
    productos: [{ SKU: "PROD-001", Nombre: "Pan de Trigo", Categoria: "Panadería", Precio: 2000, Unidad_Medida: "Unidad", Stock_Minimo: 50 }],
    proveedores: [{ NIT: "900.123.456-7", Nombre_Empresa: "Molinos S.A.", Contacto: "Juan Perez", Email: "ventas@molinos.com", Telefono: "3209876543" }],
    pedidos: [{ ID_Pedido: "PED-001", ID_Cliente: "CLI-001", Fecha: "2024-03-25", Total_COP: 50000, Estado: "Pendiente" }],
};

export default function ImportPage() {
    const [selectedEntity, setSelectedEntity] = useState<ImportEntity>("clientes");
    const [step, setStep] = useState<number>(0); // 0: Selección/Descarga, 1: Carga, 2: Previa/Validación, 3: Finalizado
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleTabChange = (_: React.SyntheticEvent, newValue: ImportEntity) => {
        setSelectedEntity(newValue);
        setStep(0);
    };

    const handleDownloadTemplate = () => {
        const headers = TEMPLATE_HEADERS[selectedEntity];
        const sample = SAMPLE_DATA[selectedEntity];
        
        // Crear hoja de trabajo
        const ws = XLSX.utils.json_to_sheet(sample, { header: headers });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, selectedEntity.toUpperCase());
        
        // Generar archivo y descargar
        XLSX.writeFile(wb, `plantilla_${selectedEntity}_myos.xlsx`);
    };

    const handleFileUpload = () => {
        setIsUploading(true);
        setProgress(0);
        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(timer);
                    setIsUploading(false);
                    setStep(2);
                    return 100;
                }
                return prev + 10;
            });
        }, 200);
    };

    const currentConfig = ENTITY_CONFIG[selectedEntity];

    return (
        <Box sx={{ p: 0 }}>

            {/* Selección de Entidad */}
            <Tabs
                value={selectedEntity}
                onChange={handleTabChange}
                sx={{
                    mb: 3,
                    borderBottom: "1px solid #e1dfdd",
                    "& .MuiTab-root": {
                        textTransform: "none",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        color: "#605e5c",
                        borderRadius: 0,
                    },
                    "& .Mui-selected": { color: "#6B3A2A !important" },
                    "& .MuiTabs-indicator": { bgcolor: "#6B3A2A", height: 3, borderRadius: 0 },
                }}
            >
                {Object.entries(ENTITY_CONFIG).map(([key, config]) => (
                    <Tab
                        key={key}
                        value={key}
                        label={config.label}
                        icon={config.icon}
                        iconPosition="start"
                        sx={{ minHeight: 48 }}
                    />
                ))}
            </Tabs>

            <Grid container spacing={3}>
                {/* Panel de Instrucciones y Plantilla */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ borderRadius: 0, border: "1px solid #e1dfdd", boxShadow: "none" }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#323130", mb: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                1. Preparar Archivo
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#605e5c", mb: 3 }}>
                                Descarga nuestra plantilla oficial para asegurar que los campos coincidan perfectamente con el sistema.
                            </Typography>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={handleDownloadTemplate}
                                startIcon={<DownloadIcon />}
                                sx={{
                                    borderRadius: 0,
                                    borderColor: "#e1dfdd",
                                    color: "#323130",
                                    textTransform: "none",
                                    fontWeight: 700,
                                    py: 1.5,
                                    "&:hover": { borderColor: "#6B3A2A", bgcolor: "#fdf8f6" },
                                }}
                            >
                                Descargar Plantilla {currentConfig.label}
                            </Button>

                            <Divider sx={{ my: 3 }} />

                            <Stack spacing={2}>
                                <Stack direction="row" spacing={1.5}>
                                    <Box sx={{ color: currentConfig.color, mt: 0.3 }}>
                                        <InfoOutlinedIcon fontSize="small" />
                                    </Box>
                                    <Typography variant="caption" sx={{ color: "#605e5c" }}>
                                        Asegúrate de que los correos electrónicos y teléfonos sigan el formato estándar para evitar errores de validación.
                                    </Typography>
                                </Stack>
                                <Stack direction="row" spacing={1.5}>
                                    <Box sx={{ color: currentConfig.color, mt: 0.3 }}>
                                        <InfoOutlinedIcon fontSize="small" />
                                    </Box>
                                    <Typography variant="caption" sx={{ color: "#605e5c" }}>
                                        Límite sugerido: 1,000 registros por archivo para un procesamiento óptimo.
                                    </Typography>
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Panel de Carga y Previsualización */}
                <Grid size={{ xs: 12, md: 8 }}>
                    {step < 2 ? (
                        <Card
                            sx={{
                                borderRadius: 0,
                                border: "2px dashed #e1dfdd",
                                boxShadow: "none",
                                bgcolor: isUploading ? "#faf9f8" : "white",
                                transition: "all 0.2s",
                                "&:hover": { borderColor: currentConfig.color, bgcolor: "#f8faff" },
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                minHeight: 300,
                                p: 4,
                                textAlign: "center",
                            }}
                        >
                            {isUploading ? (
                                <Box sx={{ width: "100%", maxWidth: 400 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                                        Procesando archivo...
                                    </Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={progress}
                                        sx={{
                                            height: 8,
                                            borderRadius: 0,
                                            bgcolor: "#f3f2f1",
                                            "& .MuiLinearProgress-bar": { bgcolor: currentConfig.color, borderRadius: 0 },
                                        }}
                                    />
                                    <Typography variant="caption" sx={{ mt: 1, display: "block", color: "#605e5c" }}>
                                        {progress}% completado
                                    </Typography>
                                </Box>
                            ) : (
                                <>
                                    <CloudUploadIcon sx={{ fontSize: 48, color: "#e1dfdd", mb: 2 }} />
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#323130", mb: 1 }}>
                                        Sube tu archivo de {currentConfig.label}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "#605e5c", mb: 3 }}>
                                        Arrastra tu archivo aquí o haz clic para buscar en tu equipo.
                                        <br />
                                        Formatos soportados: .csv, .xlsx, .xls
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        onClick={handleFileUpload}
                                        sx={{
                                            borderRadius: 0,
                                            bgcolor: "#6B3A2A",
                                            px: 4,
                                            py: 1.2,
                                            fontWeight: 700,
                                            textTransform: "none",
                                            "&:hover": { bgcolor: "#8b4f3d" },
                                        }}
                                    >
                                        Seleccionar Archivo
                                    </Button>
                                </>
                            )}
                        </Card>
                    ) : (
                        <Card sx={{ borderRadius: 0, border: "1px solid #e1dfdd", boxShadow: "none" }}>
                            <CardContent sx={{ p: 0 }}>
                                <Box sx={{ p: 3, borderBottom: "1px solid #e1dfdd", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                            Resultados de Validación
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: "#605e5c" }}>
                                            Previsualización de los primeros registros cargados.
                                        </Typography>
                                    </Box>
                                    <Stack direction="row" spacing={1}>
                                        <Chip
                                            size="small"
                                            icon={<CheckCircleOutlineIcon sx={{ fontSize: "14px !important" }} />}
                                            label="Validados: 124"
                                            sx={{ borderRadius: 0, bgcolor: "#dff6dd", color: "#107c10", fontWeight: 700 }}
                                        />
                                        <Chip
                                            size="small"
                                            icon={<WarningAmberIcon sx={{ fontSize: "14px !important" }} />}
                                            label="Errores: 1"
                                            sx={{ borderRadius: 0, bgcolor: "#fde7e9", color: "#a4262c", fontWeight: 700 }}
                                        />
                                    </Stack>
                                </Box>

                                <TableContainer sx={{ maxHeight: 400 }}>
                                    <Table size="small" stickyHeader>
                                        <TableHead>
                                            <TableRow sx={{ "& .MuiTableCell-root": { bgcolor: "#faf9f8", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" } }}>
                                                {Object.keys(MOCK_PREVIEW[selectedEntity][0]).map((h) => (
                                                    <TableCell key={h}>{h}</TableCell>
                                                ))}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {MOCK_PREVIEW[selectedEntity].map((row, i) => (
                                                <TableRow key={i} sx={{ "&:hover": { bgcolor: "#f8f7ff" } }}>
                                                    {Object.entries(row).map(([k, v]) => (
                                                        <TableCell key={k} sx={{ fontSize: "0.8rem", color: v === "Error" ? "#a4262c" : "#323130" }}>
                                                            {v === "Valido" ? (
                                                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                                                    <CheckCircleOutlineIcon sx={{ fontSize: 14, color: "#107c10" }} />
                                                                    <span>Listo</span>
                                                                </Stack>
                                                            ) : v === "Error" ? (
                                                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                                                    <WarningAmberIcon sx={{ fontSize: 14, color: "#a4262c" }} />
                                                                    <span>Error</span>
                                                                </Stack>
                                                            ) : (
                                                                String(v)
                                                            )}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                <Box sx={{ p: 3, bgcolor: "#faf9f8", display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => setStep(0)}
                                        sx={{ borderRadius: 0, textTransform: "none", fontWeight: 700, color: "#323130", borderColor: "#e1dfdd" }}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        variant="contained"
                                        sx={{
                                            borderRadius: 0,
                                            textTransform: "none",
                                            fontWeight: 700,
                                            bgcolor: "#107c10",
                                            "&:hover": { bgcolor: "#0b5a0b" },
                                            px: 4,
                                        }}
                                        onClick={() => setStep(3)}
                                    >
                                        Confirmar Importación
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    )}
                </Grid>
            </Grid>

            {/* Resultado Final (Snackbar o Alerta similar) */}
            {step === 3 && (
                <Alert
                    severity="success"
                    icon={<CheckCircleOutlineIcon fontSize="inherit" />}
                    sx={{ mt: 3, borderRadius: 0, border: "1px solid #dff6dd", "& .MuiAlert-message": { fontWeight: 600 } }}
                    action={
                        <Button color="inherit" size="small" onClick={() => setStep(0)}>
                            Nueva Carga
                        </Button>
                    }
                >
                    ¡Importación exitosa! 124 registros de {currentConfig.label} han sido procesados y guardados en la base de datos.
                </Alert>
            )}
        </Box>
    );
}

// Sub-componente Chip personalizado para evitar el radius por defecto si no se puede via sx
const Chip = (props: any) => (
    <Box
        sx={{
            display: "inline-flex",
            alignItems: "center",
            px: 1,
            py: 0.2,
            fontSize: "0.7rem",
            border: "1px solid transparent",
            ...props.sx,
            borderRadius: 0, // Forzar aqui
        }}
    >
        {props.icon && <Box sx={{ mr: 0.5, display: "flex" }}>{props.icon}</Box>}
        {props.label}
    </Box>
);
