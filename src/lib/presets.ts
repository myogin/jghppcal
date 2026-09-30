export type UkuranPlat = "52" | "58";
export type Mesin = "52" | "58";
export type JenisCetak = "separasi" | "spot" | "block" | "specialInk" | "tidak";
export type JenisLaminasi = "tidak" | "doff" | "glossy";
export type Sisi = 1 | 2;

export const PRESET_PLANO = [
  { p: 65, l: 100 },
  { p: 79, l: 109 },
  { p: 61, l: 86 },
  { p: 72, l: 102 },
];

export const PLAT: Record<UkuranPlat, { harga: number }> = {
  "52": { harga: 25_000 },
  "58": { harga: 40_000 },
};

// Pilihan dropdown ongkos cetak; `plat` = jumlah plat bawaan.
export const JENIS_CETAK: Record<JenisCetak, { label: string; plat: number }> = {
  separasi: { label: "Separasi / Full color", plat: 4 },
  spot: { label: "Spot", plat: 1 },
  block: { label: "Block", plat: 1 },
  specialInk: { label: "Special ink", plat: 1 },
  tidak: { label: "Tidak", plat: 0 },
};

// Persentase markup dari HPP per pcs untuk harga jual.
export const MARKUP_HARGA_JUAL = [30, 35, 40, 45, 50];

// Tarif laminasi per cm² per sisi.
export const LAMINASI: Record<JenisLaminasi, { label: string; tarif: number }> = {
  tidak: { label: "Tidak", tarif: 0 },
  doff: { label: "Doff", tarif: 0.22 },
  glossy: { label: "Glossy", tarif: 0.2 },
};
