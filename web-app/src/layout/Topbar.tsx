import {
    AppBar,
    Box,
    Button,
    IconButton,
    Toolbar,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import AddIcon from "@mui/icons-material/Add";
import LogoutIcon from "@mui/icons-material/Logout";
import { SIDEBAR_WIDTH } from "./Sidebar";
import { useAuth } from "../hooks/useAuth.ts";

import { useLocation, useNavigate } from "react-router-dom";

interface TopbarProps {
    onMenuClick: () => void;
}

const getHeaderInfo = (pathname: string) => {
    switch (pathname) {
        case "/":
            return { title: "Resumen del día", subtitle: "Control rápido de pedidos, producción y entregas" };
        case "/clientes":
            return { title: "Módulo de Clientes", subtitle: "Gestión de base de datos y segmentación" };
        case "/productos":
            return { title: "Catálogo de Productos", subtitle: "Administración de inventario y precios" };
        case "/orders":
            return { title: "Gestión de Pedidos", subtitle: "Control de ventas y facturación" };
        default:
            return { title: "Myos Panadería", subtitle: "Sistema Operativo" };
    }
};

export default function Topbar({ onMenuClick }: TopbarProps) {
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { title, subtitle } = getHeaderInfo(location.pathname);

    const getActionLabel = () => {
        if (location.pathname === "/clientes") return "+ Nuevo cliente";
        if (location.pathname === "/productos") return "+ Nuevo producto";
        if (location.pathname === "/orders") return "+ Nuevo pedido";
        return "+ Nuevo pedido";
    };

    const handleNewAction = () => {
        if (location.pathname === "/") {
            navigate("/orders"); // O abrir modal de pedido si existiera
        } else {
            // Re-navigates to same path but with openModal=true
            // useEntityManagement listens to this
            navigate({ pathname: location.pathname, search: "?openModal=true" });
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    return (
        <AppBar
            position="fixed"
            elevation={0}
            sx={{
                width: { md: `calc(100% - ${SIDEBAR_WIDTH}px)` },
                ml: { md: `${SIDEBAR_WIDTH}px` },
                bgcolor: "white",
                borderBottom: "1px solid",
                borderColor: "divider",
                color: "text.primary",
                zIndex: theme.zIndex.appBar,
            }}
        >
            <Toolbar sx={{ gap: { xs: 1, sm: 2 }, py: 1 }}>
                {/* Hamburger — only on mobile */}
                {!isDesktop && (
                    <IconButton
                        edge="start"
                        onClick={onMenuClick}
                        sx={{ color: "text.primary", mr: 0.5 }}
                        aria-label="Abrir menú"
                    >
                        <MenuIcon />
                    </IconButton>
                )}

                {/* Page title area */}
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography
                        variant="h5"
                        sx={{ 
                            fontWeight: 800, 
                            lineHeight: 1.1, 
                            whiteSpace: "nowrap", 
                            overflow: "hidden", 
                            textOverflow: "ellipsis",
                            fontSize: { xs: "1.1rem", sm: "1.5rem" }
                        }}
                    >
                        {title}
                    </Typography>
                    {isDesktop && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                            {subtitle}
                        </Typography>
                    )}
                </Box>

                {/* Global actions area */}
                <Box sx={{ flexGrow: 0, display: "flex", gap: 1.5 }}>
                    {/* Export — hidden on Dashboard */}
                    {isDesktop && location.pathname !== "/" && (
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<FileDownloadOutlinedIcon />}
                            sx={{ textTransform: "none", borderRadius: 2, whiteSpace: "nowrap", borderColor: "divider", color: "text.secondary" }}
                        >
                            Exportar
                        </Button>
                    )}

                    {/* Main Action Button */}
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={handleNewAction}
                        sx={{
                            textTransform: "none",
                            borderRadius: 2,
                            bgcolor: "#F59E0B",
                            "&:hover": { bgcolor: "#D97706" },
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                            px: 2
                        }}
                    >
                        {getActionLabel()}
                    </Button>

                    <Button
                        variant="text"
                        size="small"
                        startIcon={<LogoutIcon />}
                        onClick={handleLogout}
                        sx={{
                            textTransform: "none",
                            borderRadius: 2,
                            color: "text.secondary",
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                            px: 1.5,
                        }}
                    >
                        Salir
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
}
