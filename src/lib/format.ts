const rupiahFmt = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});
const angkaFmt = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 });

export const rupiah = (n: number) => rupiahFmt.format(n);
export const angka = (n: number) => angkaFmt.format(n);

/**
 * Baca angka format Indonesia: "20.000" → 20000, "0,22" → 0.22, "1.250,5" → 1250.5.
 * Titik tanpa koma dianggap desimal kecuali polanya ribuan (mis. "20.000").
 * String kosong / tidak valid → null.
 */
export function parseAngka(raw: string): number | null {
  let s = raw.trim().replace(/\s|rp/gi, "");
  if (s === "") return null;
  if (s.includes(",")) {
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (/^-?\d{1,3}(\.\d{3})+$/.test(s)) {
    s = s.replace(/\./g, "");
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}
