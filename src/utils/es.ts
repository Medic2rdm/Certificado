/* Convierte números y fechas al formato escrito en español,
   p. ej. 2026-09-06 → "SEIS DE SEPTIEMBRE DEL DOS MIL VEINTISÉIS" */

const UNITS = [
  "",
  "UNO",
  "DOS",
  "TRES",
  "CUATRO",
  "CINCO",
  "SEIS",
  "SIETE",
  "OCHO",
  "NUEVE",
  "DIEZ",
  "ONCE",
  "DOCE",
  "TRECE",
  "CATORCE",
  "QUINCE",
  "DIECISÉIS",
  "DIECISIETE",
  "DIECIOCHO",
  "DIECINUEVE",
];

const TENS = [
  "",
  "DIEZ",
  "VEINTE",
  "TREINTA",
  "CUARENTA",
  "CINCUENTA",
  "SESENTA",
  "SETENTA",
  "OCHENTA",
  "NOVENTA",
];

const HUNDREDS = [
  "",
  "CIENTO",
  "DOSCIENTOS",
  "TRESCIENTOS",
  "CUATROCIENTOS",
  "QUINIENTOS",
  "SEISCIENTOS",
  "SETECIENTOS",
  "OCHOCIENTOS",
  "NOVECIENTOS",
];

const MONTHS = [
  "ENERO",
  "FEBRERO",
  "MARZO",
  "ABRIL",
  "MAYO",
  "JUNIO",
  "JULIO",
  "AGOSTO",
  "SEPTIEMBRE",
  "OCTUBRE",
  "NOVIEMBRE",
  "DICIEMBRE",
];

function below1000(n: number): string {
  const parts: string[] = [];
  const h = Math.floor(n / 100);
  const r = n % 100;
  if (h === 1 && r === 0) parts.push("CIEN");
  else if (h > 0) parts.push(HUNDREDS[h]);
  if (r > 0) {
    if (r < 21) parts.push(UNITS[r]);
    else if (r < 30) parts.push("VEINTI" + UNITS[r - 20]);
    else {
      const t = Math.floor(r / 10);
      const u = r % 10;
      parts.push(TENS[t] + (u > 0 ? " Y " + UNITS[u] : ""));
    }
  }
  return parts.join(" ");
}

export function numberToWords(n: number): string {
  if (n === 0) return "CERO";
  const parts: string[] = [];
  const m = Math.floor(n / 1_000_000);
  const k = Math.floor((n % 1_000_000) / 1000);
  const r = n % 1000;
  if (m > 0) parts.push(m === 1 ? "UN MILLÓN" : numberToWords(m) + " MILLONES");
  if (k > 0) parts.push(k === 1 ? "MIL" : numberToWords(k) + " MIL");
  if (r > 0) {
    if (k > 0 && r === 100) parts.push("CIEN");
    else parts.push(below1000(r));
  }
  return parts.join(" ");
}

function yearToWords(y: number): string {
  if (y < 1000) return numberToWords(y);
  const k = Math.floor(y / 1000);
  const r = y % 1000;
  const head = k === 1 ? "MIL" : numberToWords(k) + " MIL";
  return r > 0 ? head + " " + numberToWords(r) : head;
}

/** "2026-09-06" → { day: 6, month: 9, year: 2026 } (o null si no es válido) */
export function parseISO(iso: string): { day: number; month: number; year: number } | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (d < 1 || d > 31 || m < 1 || m > 12 || y < 1000) return null;
  return { day: d, month: m, year: y };
}

/** "2026-09-06" → "SEIS DE SEPTIEMBRE DEL DOS MIL VEINTISÉIS" */
export function dateInWords(iso: string): string | null {
  const p = parseISO(iso);
  if (!p) return null;
  return `${numberToWords(p.day)} DE ${MONTHS[p.month - 1]} DEL ${yearToWords(p.year)}`;
}

/** "2026-09-06" → "06/09/2026" */
export function formatDMY(iso: string): string {
  const p = parseISO(iso);
  if (!p) return iso;
  return `${String(p.day).padStart(2, "0")}/${String(p.month).padStart(2, "0")}/${p.year}`;
}

/** "2026-09-06" → "6 de septiembre de 2026" */
export function dateHuman(iso: string): string {
  const p = parseISO(iso);
  if (!p) return iso || "—";
  const months = MONTHS.map((m) => m.charAt(0) + m.slice(1).toLowerCase());
  return `${p.day} de ${months[p.month - 1]} de ${p.year}`;
}

/** Suma días a una fecha ISO y devuelve ISO (o null si la fecha no es válida) */
export function addDaysISO(iso: string, days: number): string | null {
  const p = parseISO(iso);
  if (!p) return null;
  const d = new Date(p.year, p.month - 1, p.day);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}
