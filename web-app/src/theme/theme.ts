import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#6B3A2A", // Café Cacao (Corteza de Pan)
            light: "#8B4F3D",
            dark: "#4A271C",
        },
        secondary: {
            main: "#A67C52", // Trigo Dorado
            light: "#C5A17D",
            dark: "#835C3A",
        },
        warning: {
            main: "#F59E0B", // Ámbar Miel
        },
        success: {
            main: "#107C10", // Verde Frescura (Basado en el sistema)
        },
        error: {
            main: "#A4262C", // Rojo Ladrillo/Horno
        },
        background: {
            default: "#FAF9F8", // Crema Harina
            paper: "#FFFFFF",
        },
        text: {
            primary: "#323130", // Carbón Vegetal
            secondary: "#605E5C", // Piedra
        },
        divider: "#EDEBE9",
    },
    shape: {
        borderRadius: 0, // Hard-edge requested for corporate look
    },
    typography: {
        fontFamily:
            'Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
        fontSize: 14,
        h1: { fontSize: "1.75rem", fontWeight: 800 },
        h2: { fontSize: "1.5rem", fontWeight: 800 },
        h5: { fontSize: "1.5rem", fontWeight: 800 },
        subtitle1: { fontSize: "1rem", fontWeight: 700 },
        subtitle2: { fontSize: "0.875rem", fontWeight: 600 },
        body1: { fontSize: "0.95rem" },
        body2: { fontSize: "0.875rem" },
        caption: { fontSize: "0.75rem", fontWeight: 500 },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 0,
                    textTransform: "none",
                    fontWeight: 700,
                    boxShadow: "none",
                    "&:hover": {
                        boxShadow: "none",
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 0,
                    boxShadow: "none",
                    border: "1px solid #EDEBE9",
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 0,
                },
            },
        },
    },
});