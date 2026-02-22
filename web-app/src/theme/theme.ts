import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#7A4E2D", // cacao
        },
        secondary: {
            main: "#B26A3C", // caramelo
        },
        warning: {
            main: "#F59E0B", // ámbar
        },
        success: {
            main: "#16A34A",
        },
        error: {
            main: "#DC2626",
        },
        background: {
            default: "#FAF7F2", // crema
            paper: "#FFFFFF",
        },
        text: {
            primary: "#1F2937",
            secondary: "#6B7280",
        },
        divider: "#E7E0D6",
    },
    shape: {
        borderRadius: 16,
    },
    typography: {
        fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, "Noto Sans", "Helvetica Neue", sans-serif',
        fontSize: 14,
        h1: { fontSize: "1.75rem", fontWeight: 800 },
        h2: { fontSize: "1.5rem", fontWeight: 800 },
        h5: { fontSize: "1.5rem", fontWeight: 800 },
        subtitle1: { fontSize: "1rem", fontWeight: 600 },
        subtitle2: { fontSize: "0.875rem" },
        body1: { fontSize: "0.95rem" },
        body2: { fontSize: "0.875rem" },
        caption: { fontSize: "0.8rem" },
    },
});