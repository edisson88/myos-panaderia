// Generación y descarga de la factura en PDF A4.
// Extraído de InvoiceDialog.tsx para poder reutilizarlo desde la pestaña de Pedidos.

export interface InvoiceLineItem {
  productName: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface InvoiceData {
  orderCode: string;
  customerName: string | null;
  customerPhone?: string | null;
  customerAddress?: string | null;
  createdAt: string;
  deliveryDate?: string | null;
  notes?: string | null;
  total: number;
  items: InvoiceLineItem[];
}

const BAKERY = {
  name: "Panadería Myos",
  address: "Mz E Cs 29 Terrazas de Santa Ana",
  city: "Ibagué",
  phone: "3118128272",
};

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

function generateA4HTML(order: InvoiceData): string {
  const itemRows = order.items
    .map(
      (item) => `
      <tr>
        <td>${item.productName ?? ""}</td>
        <td align="center">${item.quantity}</td>
        <td align="right">${formatCOP(item.unitPrice)}</td>
        <td align="right"><strong>${formatCOP(item.subtotal)}</strong></td>
      </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Factura ${order.orderCode}</title>
  <style>
    @page { size: A4; margin: 20mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Arial, sans-serif;
      font-size: 13px;
      color: #1a1a1a;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
      padding-bottom: 16px;
      border-bottom: 2px solid #7b3c1e;
    }
    .bakery-name {
      font-size: 22px;
      font-weight: bold;
      color: #7b3c1e;
    }
    .bakery-info {
      font-size: 11px;
      color: #555;
      line-height: 1.6;
      margin-top: 4px;
    }
    .invoice-title {
      text-align: right;
    }
    .invoice-title h2 {
      font-size: 20px;
      color: #7b3c1e;
      margin-bottom: 4px;
    }
    .invoice-title p {
      font-size: 11px;
      color: #555;
    }
    .meta {
      display: flex;
      gap: 32px;
      margin-bottom: 28px;
    }
    .meta-block { flex: 1; }
    .meta-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #888;
      font-weight: bold;
      margin-bottom: 6px;
    }
    .meta-value {
      font-size: 13px;
      color: #1a1a1a;
      line-height: 1.5;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    thead tr {
      background: #7b3c1e;
      color: white;
    }
    thead th {
      padding: 10px 12px;
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    thead th:not(:first-child) { text-align: right; }
    tbody tr { border-bottom: 1px solid #f0ece8; }
    tbody tr:nth-child(even) { background: #faf8f6; }
    tbody td { padding: 10px 12px; font-size: 13px; }
    tbody td:not(:first-child) { text-align: right; }
    .total-section {
      display: flex;
      justify-content: flex-end;
    }
    .total-box {
      width: 240px;
      border: 1px solid #e0d8d0;
      padding: 16px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      font-size: 13px;
    }
    .total-row.final {
      border-top: 2px solid #7b3c1e;
      margin-top: 8px;
      padding-top: 8px;
      font-size: 16px;
      font-weight: bold;
      color: #7b3c1e;
    }
    .notes {
      margin-top: 24px;
      padding: 12px;
      background: #faf8f6;
      border-left: 3px solid #7b3c1e;
      font-size: 12px;
      color: #555;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 11px;
      color: #888;
      border-top: 1px solid #e0d8d0;
      padding-top: 16px;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>

  <div class="header">
    <div>
      <div class="bakery-name">${BAKERY.name}</div>
      <div class="bakery-info">
        ${BAKERY.address}<br/>
        ${BAKERY.city}<br/>
        Tel: ${BAKERY.phone}
      </div>
    </div>
    <div class="invoice-title">
      <h2>FACTURA</h2>
      <p>${order.orderCode}</p>
      <p>${formatDateTime(order.createdAt)}</p>
    </div>
  </div>

  <div class="meta">
    <div class="meta-block">
      <div class="meta-label">Cliente</div>
      <div class="meta-value">${order.customerName ?? "—"}</div>
      ${order.customerPhone ? `<div class="meta-value" style="color:#888;">${order.customerPhone}</div>` : ""}
      ${order.customerAddress ? `<div class="meta-value" style="color:#888; font-size:11px;">${order.customerAddress}</div>` : ""}
    </div>
    ${order.deliveryDate ? `
    <div class="meta-block">
      <div class="meta-label">Fecha de entrega</div>
      <div class="meta-value">${formatDateTime(order.deliveryDate)}</div>
    </div>` : ""}
  </div>

  <table>
    <thead>
      <tr>
        <th>Producto</th>
        <th>Cant.</th>
        <th>V. Unit.</th>
        <th>Subtotal</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
  </table>

  <div class="total-section">
    <div class="total-box">
      <div class="total-row final">
        <span>TOTAL</span>
        <span>${formatCOP(order.total)}</span>
      </div>
    </div>
  </div>

  ${order.notes ? `
  <div class="notes">
    <strong>Notas:</strong> ${order.notes}
  </div>` : ""}

  <div class="footer">
    ¡Gracias por su compra! · ${BAKERY.name} · ${BAKERY.city}
  </div>

</body>
</html>`;
}

export function downloadInvoicePDF(order: InvoiceData): void {
  const html = generateA4HTML(order);
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
    win.close();
  }, 500);
}
