import { parseAngka } from "@/lib/format";
import type { HppInput } from "@/lib/hpp";
import type { JenisCetak, JenisLaminasi, Mesin, Sisi, UkuranPlat } from "@/lib/presets";

/** State form menyimpan teks mentah supaya input "0,22" atau "20.000" tidak berubah saat diketik. */
export interface AddOnForm {
  aktif: boolean;
  harga: string;
  qty: string;
  catatan: string;
}

export interface FormState {
  jenisCetakan: string;
  qtyOrder: string;
  jenisKertas: string;
  gramatur: string;
  planoP: string;
  planoL: string;
  cetakP: string;
  cetakL: string;
  isiPlanoManual: string;
  jumlah: string;
  layout: string;
  hargaKertas: string;
  ukuranPlat: UkuranPlat;
  hargaPlat: string;
  jumlahPlatManual: string;
  mesin: Mesin;
  jenisCetak: JenisCetak;
  ongkosCetak: string;
  laminasi: JenisLaminasi;
  tarifLaminasi: string;
  sisiLaminasi: Sisi;
  pisau: string;
  plong: string;
  jasaPotong: string;
  finishing: string;
  taliJenis: string;
  tali: AddOnForm;
  kertasAlas: AddOnForm;
  kertasKuping: AddOnForm;
  lem: AddOnForm;
}

const addOnKosong: AddOnForm = { aktif: false, harga: "", qty: "", catatan: "" };

export const FORM_AWAL: FormState = {
  jenisCetakan: "",
  qtyOrder: "",
  jenisKertas: "",
  gramatur: "",
  planoP: "79",
  planoL: "109",
  cetakP: "",
  cetakL: "",
  isiPlanoManual: "",
  jumlah: "",
  layout: "",
  hargaKertas: "",
  ukuranPlat: "52",
  hargaPlat: "",
  jumlahPlatManual: "",
  mesin: "52",
  jenisCetak: "separasi",
  ongkosCetak: "",
  laminasi: "tidak",
  tarifLaminasi: "",
  sisiLaminasi: 1,
  pisau: "",
  plong: "",
  jasaPotong: "",
  finishing: "",
  taliJenis: "",
  tali: addOnKosong,
  kertasAlas: addOnKosong,
  kertasKuping: addOnKosong,
  lem: addOnKosong,
};

const p = parseAngka;
const addOn = (a: AddOnForm) => ({ aktif: a.aktif, harga: p(a.harga), qty: p(a.qty), catatan: a.catatan.trim() });

export function toInput(f: FormState): HppInput {
  return {
    jenisCetakan: f.jenisCetakan.trim(),
    qtyOrder: p(f.qtyOrder),
    jenisKertas: f.jenisKertas.trim(),
    gramatur: p(f.gramatur),
    planoP: p(f.planoP),
    planoL: p(f.planoL),
    cetakP: p(f.cetakP),
    cetakL: p(f.cetakL),
    isiPlanoManual: p(f.isiPlanoManual),
    jumlah: p(f.jumlah),
    layout: p(f.layout),
    hargaKertas: p(f.hargaKertas),
    ukuranPlat: f.ukuranPlat,
    hargaPlat: p(f.hargaPlat),
    jumlahPlatManual: p(f.jumlahPlatManual),
    mesin: f.mesin,
    jenisCetak: f.jenisCetak,
    ongkosCetak: p(f.ongkosCetak),
    laminasi: f.laminasi,
    tarifLaminasi: p(f.tarifLaminasi),
    sisiLaminasi: f.sisiLaminasi,
    pisau: p(f.pisau),
    plong: p(f.plong),
    jasaPotong: p(f.jasaPotong),
    finishing: p(f.finishing),
    tali: { ...addOn(f.tali), jenis: f.taliJenis.trim() },
    kertasAlas: addOn(f.kertasAlas),
    kertasKuping: addOn(f.kertasKuping),
    lem: addOn(f.lem),
  };
}
