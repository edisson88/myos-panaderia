import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { Snackbar, Alert } from "@mui/material";
import type { AlertColor } from "@mui/material";

interface NotificationContextType {
    showNotification: (message: string, severity?: AlertColor) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [severity, setSeverity] = useState<AlertColor>("success");

    const showNotification = (msg: string, sev: AlertColor = "success") => {
        setMessage(msg);
        setSeverity(sev);
        setOpen(true);
    };

    const handleClose = (_?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === "clickaway") return;
        setOpen(false);
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <Snackbar
                open={open}
                autoHideDuration={4000}
                onClose={handleClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert 
                    onClose={handleClose} 
                    severity={severity} 
                    variant="filled" 
                    sx={{ width: "100%", borderRadius: 2, fontWeight: 600 }}
                >
                    {message}
                </Alert>
            </Snackbar>
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotification must be used within a NotificationProvider");
    }
    return context;
};
