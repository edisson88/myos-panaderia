import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
} from "@mui/material";

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: string;
    onClose: () => void;
    onConfirm: () => void;
}

export default function ConfirmDialog({ open, title, message, onClose, onConfirm }: ConfirmDialogProps) {
    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
        >
            <DialogTitle sx={{ fontWeight: 800 }}>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{message}</DialogContentText>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} sx={{ color: "text.secondary", fontWeight: 700 }}>
                    Cancelar
                </Button>
                <Button 
                    onClick={onConfirm} 
                    variant="contained" 
                    color="error"
                    sx={{ borderRadius: 2, fontWeight: 700, px: 3 }}
                >
                    Eliminar Permanentemente
                </Button>
            </DialogActions>
        </Dialog>
    );
}
