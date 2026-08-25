import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Divider,
  Box,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import type { DashboardOrder } from "../modules/dashboard/dashboard.service";
import { downloadInvoicePDF } from "../utils/invoicePdf";

// ── Datos de la panadería ─────────────────────────────────────────────────────
const BAKERY = {
  name: "Panadería Myos",
  address: "Mz E Cs 29 Terrazas de Santa Ana",
  city: "Ibagué",
  phone: "3118128272",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatCOP(value: number): string {
  return `$ ${value.toLocaleString("es-CO")}`;
}

function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Generador del HTML de la tirilla térmica ──────────────────────────────────
// Impresoras térmicas básicas no renderizan <table> de forma confiable.
// Se usa texto plano monoespaciado dentro de <pre> — el driver imprime
// carácter por carácter respetando exactamente las columnas calculadas.

const LINE_WIDTH = 28; // caracteres por línea para 80mm en fuente ~14px monoespaciada

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Alinea dos textos a izquierda y derecha dentro del ancho de línea
function twoCols(left: string, right: string, width = LINE_WIDTH): string {
  const space = width - left.length - right.length;
  if (space <= 0) return `${left}\n${right.padStart(width)}`;
  return left + " ".repeat(space) + right;
}

// Centra un texto dentro del ancho de línea
function center(text: string, width = LINE_WIDTH): string {
  if (text.length >= width) return text;
  const pad = Math.floor((width - text.length) / 2);
  return " ".repeat(pad) + text;
}

// Línea separadora
function divider(width = LINE_WIDTH): string {
  return "-".repeat(width);
}

function generateThermalHTML(order: DashboardOrder): string {
  const lines: string[] = [];

  // Encabezado
  lines.push(center(BAKERY.name.toUpperCase()));
  lines.push(center(BAKERY.address));
  lines.push(center(`${BAKERY.city} - Tel: ${BAKERY.phone}`));
  lines.push(divider());

  // Datos del pedido
  lines.push(`Pedido:  ${order.orderCode}`);
  lines.push(`Cliente: ${order.customerName}`);
  lines.push(`Fecha:   ${formatDateTime(order.createdAt)}`);
  if (order.deliveryDate) {
    lines.push(`Entrega: ${formatDateTime(order.deliveryDate)}`);
  }
  lines.push(divider());

  // Encabezado productos
  lines.push("PRODUCTO");
  lines.push(divider());

  // Items
  for (const item of order.items) {
    const name = item.productName ?? "Producto";
    lines.push(name);

    const detail = `${item.quantity} x ${formatCOP(item.unitPrice)}`;
    const subtotal = formatCOP(item.subtotal);
    lines.push(twoCols(detail, subtotal));
    lines.push("");
  }

  lines.push(divider());

  // Total
  lines.push(twoCols("TOTAL:", formatCOP(order.total)));
  lines.push(divider());

  // Notas
  if (order.notes) {
    lines.push(`Nota: ${order.notes}`);
    lines.push(divider());
  }

  // Pie
  lines.push("");
  lines.push(center("Gracias por su compra!"));
  lines.push(center(`${BAKERY.name} - ${BAKERY.city}`));
  lines.push("");
  lines.push("");

  const content = escapeHtml(lines.join("\n"));

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Factura ${order.orderCode}</title>
  <style>
    @page {
      size: 80mm auto;
      margin: 0;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 80mm;
      padding: 2mm 4mm;
    }
    pre {
      font-family: 'Courier New', Courier, monospace;
      font-size: 14px;
      font-weight: 600;
      line-height: 1.35;
      white-space: pre-wrap;
      word-break: break-word;
      color: #000;
    }
    @media print {
      body { width: 80mm; }
    }
  </style>
</head>
<body>
<pre>${content}</pre>
</body>
</html>`;
}

// ── Funciones de acción ───────────────────────────────────────────────────────
function printThermal(order: DashboardOrder): void {
  const html = generateThermalHTML(order);
  const win = window.open("", "_blank", "width=400,height=600");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
    win.close();
  }, 500);
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  open: boolean;
  order: DashboardOrder | null;
  onClose: () => void;
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function InvoiceDialog({ open, order, onClose }: Props) {
  if (!order) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 0, boxShadow: "none", border: "1px solid #e1dfdd" } } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" fontWeight={700}>
            Vista previa · {order.orderCode}
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
        <Typography variant="caption" color="#605e5c">
          {order.customerName} · {formatCOP(order.total)}
        </Typography>
      </DialogTitle>

      <Divider />

      {/* Preview de la tirilla */}
      <DialogContent sx={{ bgcolor: "#f3f2f1", py: 3 }}>
        <Box
          sx={{
            width: "302px",
            mx: "auto",
            bgcolor: "#fff",
            border: "1px solid #e1dfdd",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            p: "12px",
            fontFamily: "'Courier New', monospace",
            fontSize: "11px",
          }}
        >
          {/* Header panadería */}
          <Typography align="center" sx={{ fontFamily: "inherit", fontSize: "13px", fontWeight: 700, lineHeight: 1.3 }}>
            {BAKERY.name}
          </Typography>
          <Typography align="center" sx={{ fontFamily: "inherit", fontSize: "9px", color: "#555", lineHeight: 1.5 }}>
            {BAKERY.address}<br />
            {BAKERY.city} · Tel: {BAKERY.phone}
          </Typography>

          <Divider sx={{ my: 1, borderStyle: "dashed" }} />

          {/* Datos pedido */}
          <Stack spacing={0.25}>
            <Stack direction="row" justifyContent="space-between">
              <Typography sx={{ fontFamily: "inherit", fontSize: "9px", color: "#555" }}>Pedido:</Typography>
              <Typography sx={{ fontFamily: "inherit", fontSize: "9px", fontWeight: 700 }}>{order.orderCode}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography sx={{ fontFamily: "inherit", fontSize: "9px", color: "#555" }}>Cliente:</Typography>
              <Typography sx={{ fontFamily: "inherit", fontSize: "9px" }}>{order.customerName}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography sx={{ fontFamily: "inherit", fontSize: "9px", color: "#555" }}>Fecha:</Typography>
              <Typography sx={{ fontFamily: "inherit", fontSize: "9px" }}>{formatDateTime(order.createdAt)}</Typography>
            </Stack>
          </Stack>

          <Divider sx={{ my: 1, borderStyle: "dashed" }} />

          {/* Items */}
          {order.items.map((item) => (
            <Box key={item.id} mb={0.5}>
              <Typography sx={{ fontFamily: "inherit", fontSize: "10px", fontWeight: 600 }}>
                {item.productName ?? "—"}
              </Typography>
              <Stack direction="row" justifyContent="space-between">
                <Typography sx={{ fontFamily: "inherit", fontSize: "9px", color: "#555" }}>
                  {item.quantity} x {formatCOP(item.unitPrice)}
                </Typography>
                <Typography sx={{ fontFamily: "inherit", fontSize: "9px" }}>
                  {formatCOP(item.subtotal)}
                </Typography>
              </Stack>
            </Box>
          ))}

          <Divider sx={{ my: 1, borderStyle: "dashed" }} />

          {/* Total */}
          <Stack direction="row" justifyContent="space-between">
            <Typography sx={{ fontFamily: "inherit", fontSize: "12px", fontWeight: 700 }}>TOTAL:</Typography>
            <Typography sx={{ fontFamily: "inherit", fontSize: "12px", fontWeight: 700 }}>{formatCOP(order.total)}</Typography>
          </Stack>

          {order.notes && (
            <>
              <Divider sx={{ my: 1, borderStyle: "dashed" }} />
              <Typography sx={{ fontFamily: "inherit", fontSize: "9px", color: "#555" }}>
                Nota: {order.notes}
              </Typography>
            </>
          )}

          <Divider sx={{ my: 1, borderStyle: "dashed" }} />

          <Typography align="center" sx={{ fontFamily: "inherit", fontSize: "9px", color: "#555" }}>
            ¡Gracias por su compra!<br />
            {BAKERY.name} · {BAKERY.city}
          </Typography>
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          size="small"
          sx={{ borderRadius: 0, borderColor: "#e1dfdd", color: "#323130" }}
        >
          Cerrar
        </Button>
        <Button
          onClick={() => downloadInvoicePDF(order)}
          variant="outlined"
          size="small"
          startIcon={<PictureAsPdfIcon />}
          sx={{ borderRadius: 0, borderColor: "#0078d4", color: "#0078d4" }}
        >
          Descargar PDF A4
        </Button>
        <Button
          onClick={() => printThermal(order)}
          variant="contained"
          size="small"
          startIcon={<PrintIcon />}
          sx={{ borderRadius: 0, bgcolor: "#7b3c1e", "&:hover": { bgcolor: "#5c2d15" } }}
        >
          Imprimir tirilla
        </Button>
      </DialogActions>
    </Dialog>
  );
}
