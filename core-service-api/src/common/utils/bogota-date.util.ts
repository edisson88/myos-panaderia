// bogota-date.util.ts
//
// El servidor puede correr en cualquier zona horaria (típicamente UTC en
// hosting/cloud). El negocio opera en hora Colombia (America/Bogota), que no
// tiene horario de verano: el offset UTC-5 es fijo todo el año. Estas
// funciones anclan el cálculo de "hoy" y los límites de un día a Bogotá sin
// importar la zona horaria del proceso Node.

const BOGOTA_UTC_OFFSET = '-05:00';
const BOGOTA_OFFSET_MS = 5 * 60 * 60 * 1000;

/** Fecha (YYYY-MM-DD) en hora Bogotá para un instante dado. Por defecto, ahora mismo. */
export function getBogotaDateStr(date: Date = new Date()): string {
  const shifted = new Date(date.getTime() - BOGOTA_OFFSET_MS);
  const year = shifted.getUTCFullYear();
  const month = String(shifted.getUTCMonth() + 1).padStart(2, '0');
  const day = String(shifted.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Inicio del día (00:00 hora Bogotá) para una fecha YYYY-MM-DD, como instante UTC exacto. */
export function getBogotaDayStart(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00${BOGOTA_UTC_OFFSET}`);
}

/**
 * Rango [from, to) en UTC que cubre exactamente un día (o rango de días) en
 * hora Bogotá. Si no se pasa ninguna fecha, retorna el día de hoy en Bogotá.
 */
export function getBogotaRange(
  dateFrom?: string,
  dateTo?: string,
): { from: string; to: string } {
  const fromDateStr = dateFrom ?? dateTo ?? getBogotaDateStr();
  const toDateStr = dateTo ?? dateFrom ?? getBogotaDateStr();

  const from = getBogotaDayStart(fromDateStr);
  const toDayStart = getBogotaDayStart(toDateStr);
  const to = new Date(toDayStart.getTime() + 24 * 60 * 60 * 1000);

  return { from: from.toISOString(), to: to.toISOString() };
}
