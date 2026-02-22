import {
    AppBar,
    Box,
    Button,
    IconButton,
    InputAdornment,
    TextField,
    Toolbar,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import AddIcon from "@mui/icons-material/Add";
import { SIDEBAR_WIDTH } from "./Sidebar";

interface TopbarProps {
    onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

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
            }}
        >
            <Toolbar sx={{ gap: { xs: 1, sm: 2 } }}>
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

                {/* Page title */}
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography
                        variant="h4"
                        sx={{ fontWeight: 800, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                    >
                        Resumen del día
                    </Typography>
                    {isDesktop && (
                        <Typography variant="body1" color="text.secondary">
                            Control rápido de pedidos, producción y entregas
                        </Typography>
                    )}
                </Box>

                {/* Search — hidden on xs */}
                {isDesktop && (
                    <TextField
                        size="small"
                        placeholder="Buscar pedido, cliente o producto..."
                        sx={{ width: 280 }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                )}

                {/* Export — hidden on xs */}
                {isDesktop && (
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<FileDownloadOutlinedIcon />}
                        sx={{ textTransform: "none", borderRadius: 2, whiteSpace: "nowrap" }}
                    >
                        Exportar
                    </Button>
                )}

                {/* New order */}
                <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        bgcolor: "#F59E0B",
                        "&:hover": { bgcolor: "#D97706" },
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                    }}
                >
                    {isDesktop ? "+ Nuevo pedido" : "Nuevo"}
                </Button>
            </Toolbar>
        </AppBar>
    );
}