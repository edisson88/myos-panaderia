import {
    Box,
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Divider,
    Avatar,
    useTheme,
    useMediaQuery,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PeopleIcon from "@mui/icons-material/People";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import DownloadIcon from "@mui/icons-material/Download";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.ts";

export const SIDEBAR_WIDTH = 220;

const BRAND_COLOR = "#6B3A2A";
const BRAND_COLOR_HOVER = "#7d4432";
const BRAND_COLOR_ACTIVE = "#8b4f3d";

const navItems = [
    { label: "Dashboard", icon: <DashboardIcon fontSize="small" />, path: "/" },
    { label: "Pedidos", icon: <ReceiptLongIcon fontSize="small" />, path: "/pedidos" },
    { label: "Clientes", icon: <PeopleIcon fontSize="small" />, path: "/clientes" },
    { label: "Productos", icon: <ShoppingBagIcon fontSize="small" />, path: "/productos" },
    { label: "Producción", icon: <PrecisionManufacturingIcon fontSize="small" />, path: "/produccion" },
    { label: "Importar", icon: <DownloadIcon fontSize="small" />, path: "/importar" },
    { label: "Analítica", icon: <BarChartIcon fontSize="small" />, path: "/analitica" },
];

const bottomItems = [
    { label: "Configuración", icon: <SettingsIcon fontSize="small" />, path: "/configuracion" },
    { label: "Cerrar sesión", icon: <LogoutIcon fontSize="small" />, path: "/logout" },
];

interface SidebarProps {
    mobileOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

    const handleNav = (path: string) => {
        if (path === "/logout") {
            logout();
            navigate("/login", { replace: true });
            if (!isDesktop) onClose();
            return;
        }

        navigate(path);
        if (!isDesktop) onClose(); // close drawer on mobile after navigation
    };

    const drawerContent = (
        <Box
            sx={{
                width: SIDEBAR_WIDTH,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                bgcolor: BRAND_COLOR,
                color: "white",
            }}
        >
            {/* Brand */}
            <Box sx={{ px: 2, py: 2.5, display: "flex", alignItems: "center", gap: 1.5 }}>
                <Avatar
                    sx={{
                        bgcolor: "rgba(255,255,255,0.2)",
                        width: 34,
                        height: 34,
                        fontSize: 14,
                        fontWeight: 800,
                    }}
                >
                    M
                </Avatar>
                <Box>
                    <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 800, color: "white", lineHeight: 1.2 }}
                    >
                        Myos Panadería
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{ color: "rgba(255,255,255,0.65)", fontSize: 10 }}
                    >
                        Pedidos y operaciones
                    </Typography>
                </Box>
            </Box>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.15)" }} />

            {/* Nav items */}
            <List dense sx={{ flex: 1, px: 1, py: 1 }}>
                {navItems.map((item) => {
                    const active = location.pathname === item.path;
                    return (
                        <ListItemButton
                            key={item.label}
                            onClick={() => handleNav(item.path)}
                            sx={{
                                borderRadius: 2,
                                mb: 0.5,
                                color: active ? "white" : "rgba(255,255,255,0.75)",
                                bgcolor: active ? BRAND_COLOR_ACTIVE : "transparent",
                                "&:hover": { bgcolor: BRAND_COLOR_HOVER, color: "white" },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 32, color: "inherit" }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.label}
                                primaryTypographyProps={{ fontSize: 16, fontWeight: active ? 700 : 400 }}
                            />
                        </ListItemButton>
                    );
                })}
            </List>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.15)" }} />

            {/* Bottom items */}
            <List dense sx={{ px: 1, py: 1 }}>
                {bottomItems.map((item) => (
                    <ListItemButton
                        key={item.label}
                        onClick={() => handleNav(item.path)}
                        sx={{
                            borderRadius: 2,
                            mb: 0.5,
                            color: "rgba(255,255,255,0.75)",
                            "&:hover": { bgcolor: BRAND_COLOR_HOVER, color: "white" },
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 32, color: "inherit" }}>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText
                            primary={item.label}
                            primaryTypographyProps={{ fontSize: 15 }}
                        />
                    </ListItemButton>
                ))}
            </List>
        </Box>
    );

    return (
        <Box
            component="nav"
            sx={{ width: { md: SIDEBAR_WIDTH }, flexShrink: { md: 0 } }}
        >
            {/* Mobile: temporary drawer (overlay) */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={onClose}
                ModalProps={{ keepMounted: true }} // better mobile performance
                sx={{
                    display: { xs: "block", md: "none" },
                    "& .MuiDrawer-paper": {
                        width: SIDEBAR_WIDTH,
                        boxSizing: "border-box",
                        border: "none",
                    },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Desktop: permanent drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: "none", md: "block" },
                    "& .MuiDrawer-paper": {
                        width: SIDEBAR_WIDTH,
                        boxSizing: "border-box",
                        border: "none",
                    },
                }}
                open
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
}