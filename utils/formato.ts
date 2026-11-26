// Funciones de formato reutilizables (moneda, fechas, HTML seguro).

/** Formatea un monto en bolivianos: 12.5 -> "Bs. 12.50" */
export const formatBs = (valor: number | string | null | undefined): string =>
  `Bs. ${Number(valor || 0).toFixed(2)}`;

/** Fecha y hora local (formato boliviano). */
export const formatFecha = (fecha: string | Date): string =>
  new Date(fecha).toLocaleString('es-BO');

/** Escapa texto para insertarlo de forma segura dentro de HTML (recibos PDF). */
export const escapeHtml = (valor: unknown): string =>
  String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
