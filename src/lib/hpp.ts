import { angka, rupiah } from "./format";
import {
  JENIS_CETAK,
  JenisCetak,
  JenisLaminasi,
  LAMINASI,
  MARKUP_HARGA_JUAL,
  Mesin,
  PLAT,
  Sisi,
  UkuranPlat,
} from "./presets";

/** Angka kosong = null. Ukuran dalam cm, harga dalam Rp. */
type N = number | null;

export interface AddOn {
  aktif: boolean;
  harga: N; // harga satuan
  qty: N; // null → quantity order
  catatan?: string;
}

export interface HppInput {
  jenisCetakan: string; // mis. paperbag, brosur
  qtyOrder: N; // quantity order (pcs jadi)

  jenisKertas: string;
  gramatur: N;
  planoP: N;
  planoL: N;
  cetakP: N;
  cetakL: N;
  isiPlanoManual: N; // override kalkulasi plano
  jumlah: N; // jumlah kertas cetak
  layout: N; // plat/layout 1/x, null → 1
  hargaKertas: N; // per lembar plano

  ukuranPlat: UkuranPlat;
  hargaPlat: N; // null → harga bawaan ukuran plat
  jumlahPlatManual: N; // null → auto dari jenis cetak
  mesin: Mesin;
  jenisCetak: JenisCetak;
  ongkosCetak: N;

  laminasi: JenisLaminasi;
  tarifLaminasi: N; // null → tarif bawaan
  sisiLaminasi: Sisi;

  pisau: N;
  plong: N;
  jasaPotong: N;
  finishing: N;

  tali: AddOn & { jenis: string };
  kertasAlas: AddOn;
  kertasKuping: AddOn;
  lem: AddOn;
}

export interface Rincian {
  key: string;
  label: string;
  rumus: string;
  nilai: number;
}

export interface HargaJual {
  persen: number;
  perPcs: number;
  total: number;
}

export interface HppResult {
  isiPlano: number;
  isiPlanoAuto: number;
  isiPlanoRotasi: number; // kalau kertas cetak diputar 90°
  lembarCetak: number;
  jumlahPlano: number;
  jumlahPlat: number;
  rincian: Rincian[];
  qtyOrder: number;
  total: number;
  perPcs: number; // total / quantity order
  hargaJual: HargaJual[];
  errors: string[];
}

const v = (n: N) => n ?? 0;

/** Isi per plano dengan orientasi tetap: floor(planoP/cetakP) × floor(planoL/cetakL). */
export function kalkulasiPlano(planoP: number, planoL: number, cetakP: number, cetakL: number) {
  if (planoP <= 0 || planoL <= 0 || cetakP <= 0 || cetakL <= 0) return 0;
  return Math.floor(planoP / cetakP) * Math.floor(planoL / cetakL);
}

export function jumlahPlatAuto(jenisCetak: JenisCetak) {
  return JENIS_CETAK[jenisCetak].plat;
}

export function hitungHpp(input: HppInput): HppResult {
  const errors: string[] = [];

  const wajib: [string, N][] = [
    ["Ukuran plano", input.planoP === null || input.planoL === null ? null : 1],
    ["Ukuran kertas cetak", input.cetakP === null || input.cetakL === null ? null : 1],
    ["Quantity order", input.qtyOrder],
    ["Jumlah kertas cetak", input.jumlah],
  ];
  for (const [label, n] of wajib) if (n === null) errors.push(`${label} wajib diisi.`);

  const tidakBolehNegatif: [string, N][] = [
    ["Quantity order", input.qtyOrder],
    ["Gramatur", input.gramatur],
    ["Ukuran plano", input.planoP],
    ["Ukuran plano", input.planoL],
    ["Ukuran kertas cetak", input.cetakP],
    ["Ukuran kertas cetak", input.cetakL],
    ["Isi per plano", input.isiPlanoManual],
    ["Jumlah kertas cetak", input.jumlah],
    ["Layout", input.layout],
    ["Harga kertas", input.hargaKertas],
    ["Harga plat", input.hargaPlat],
    ["Jumlah plat", input.jumlahPlatManual],
    ["Ongkos cetak", input.ongkosCetak],
    ["Tarif laminasi", input.tarifLaminasi],
    ["Pisau", input.pisau],
    ["Plong", input.plong],
    ["Jasa potong", input.jasaPotong],
    ["Finishing", input.finishing],
    ["Harga tali", input.tali.harga],
    ["Qty tali", input.tali.qty],
    ["Harga kertas alas", input.kertasAlas.harga],
    ["Qty kertas alas", input.kertasAlas.qty],
    ["Harga kertas kuping", input.kertasKuping.harga],
    ["Qty kertas kuping", input.kertasKuping.qty],
    ["Harga lem", input.lem.harga],
    ["Qty lem", input.lem.qty],
  ];
  const negatif = new Set(tidakBolehNegatif.filter(([, n]) => n !== null && n < 0).map(([l]) => l));
  for (const label of negatif) errors.push(`${label} tidak boleh negatif.`);

  const planoP = v(input.planoP);
  const planoL = v(input.planoL);
  const cetakP = v(input.cetakP);
  const cetakL = v(input.cetakL);
  const jumlah = Math.max(0, v(input.jumlah));
  const qtyOrder = Math.max(0, v(input.qtyOrder));

  const isiPlanoAuto = kalkulasiPlano(planoP, planoL, cetakP, cetakL);
  const isiPlanoRotasi = kalkulasiPlano(planoP, planoL, cetakL, cetakP);
  const isiPlano =
    input.isiPlanoManual !== null && input.isiPlanoManual > 0
      ? Math.floor(input.isiPlanoManual)
      : isiPlanoAuto;

  const ukuranLengkap = planoP > 0 && planoL > 0 && cetakP > 0 && cetakL > 0;
  if (ukuranLengkap && isiPlano === 0) {
    errors.push("Kertas cetak lebih besar dari plano, tidak muat satu pun.");
  }
  if (input.qtyOrder === 0) errors.push("Quantity order harus lebih dari 0.");
  if (input.jumlah === 0) errors.push("Jumlah kertas cetak harus lebih dari 0.");

  const layout = input.layout !== null && input.layout > 0 ? input.layout : 1;
  const lembarCetak = Math.ceil(jumlah / layout);
  const jumlahPlano = isiPlano > 0 ? Math.ceil(lembarCetak / isiPlano) : 0;

  const hargaKertas = Math.max(0, v(input.hargaKertas));
  const hargaPlat = input.hargaPlat ?? PLAT[input.ukuranPlat].harga;
  const jumlahPlat =
    input.jumlahPlatManual ?? jumlahPlatAuto(input.jenisCetak);
  const tarifLaminasi =
    input.laminasi === "tidak" ? 0 : (input.tarifLaminasi ?? LAMINASI[input.laminasi].tarif);
  const luasCetak = cetakP * cetakL;

  const layoutTeks = layout > 1 ? ` / ${angka(layout)}` : "";
  const rincian: Rincian[] = [
    {
      key: "kertas",
      label: `Modal kertas${input.jenisKertas ? ` (${input.jenisKertas}${input.gramatur ? ` ${angka(input.gramatur)} gsm` : ""})` : ""}`,
      rumus: `${angka(jumlah)}${layoutTeks} / ${isiPlano} = ${angka(jumlahPlano)} plano × ${rupiah(hargaKertas)}`,
      nilai: jumlahPlano * hargaKertas,
    },
    {
      key: "plat",
      label: `Plat ${input.ukuranPlat}`,
      rumus: `${angka(jumlahPlat)} plat × ${rupiah(hargaPlat)}`,
      nilai: jumlahPlat * hargaPlat,
    },
    {
      key: "cetak",
      label: `Ongkos cetak (mesin ${input.mesin}, ${JENIS_CETAK[input.jenisCetak].label})`,
      rumus: "Input manual",
      nilai: v(input.ongkosCetak),
    },
  ];

  if (input.laminasi !== "tidak") {
    rincian.push({
      key: "laminasi",
      label: `Laminasi ${LAMINASI[input.laminasi].label.toLowerCase()} ${input.sisiLaminasi} sisi`,
      rumus: `${angka(tarifLaminasi)} × ${angka(luasCetak)} cm² × ${angka(lembarCetak)} lembar${input.sisiLaminasi === 2 ? " × 2 sisi" : ""}`,
      nilai: tarifLaminasi * luasCetak * lembarCetak * input.sisiLaminasi,
    });
  }

  const manual: [string, string, N][] = [
    ["pisau", "Pisau", input.pisau],
    ["plong", "Plong", input.plong],
    ["potong", "Jasa potong", input.jasaPotong],
    ["finishing", "Finishing", input.finishing],
  ];
  for (const [key, label, n] of manual) {
    if (v(n) > 0) rincian.push({ key, label, rumus: "Input manual", nilai: v(n) });
  }

  const addOns: [string, string, AddOn][] = [
    ["tali", `Tali paperbag${input.tali.jenis ? ` (${input.tali.jenis})` : ""}`, input.tali],
    ["alas", "Kertas alas", input.kertasAlas],
    ["kuping", "Kertas kuping", input.kertasKuping],
    ["lem", "Lem", input.lem],
  ];
  for (const [key, label, a] of addOns) {
    if (!a.aktif) continue;
    const qty = a.qty ?? (qtyOrder || jumlah);
    rincian.push({
      key,
      label,
      rumus: `${angka(qty)} × ${rupiah(v(a.harga))}${a.catatan ? ` · ${a.catatan}` : ""}`,
      nilai: qty * v(a.harga),
    });
  }

  for (const r of rincian) r.nilai = Math.max(0, Math.round(r.nilai));
  const total = rincian.reduce((s, r) => s + r.nilai, 0);
  const perPcs = qtyOrder > 0 ? total / qtyOrder : 0;
  const hargaJual = MARKUP_HARGA_JUAL.map((persen) => {
    const hargaPcs = perPcs * (1 + persen / 100);
    return { persen, perPcs: hargaPcs, total: hargaPcs * qtyOrder };
  });

  return {
    isiPlano,
    isiPlanoAuto,
    isiPlanoRotasi,
    lembarCetak,
    jumlahPlano,
    jumlahPlat,
    rincian,
    qtyOrder,
    total,
    perPcs,
    hargaJual,
    errors,
  };
}
