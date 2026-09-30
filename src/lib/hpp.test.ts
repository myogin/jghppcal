import { describe, expect, it } from "vitest";
import { parseAngka } from "./format";
import { HppInput, hitungHpp, kalkulasiPlano } from "./hpp";

const addOnOff = { aktif: false, harga: null, qty: null, catatan: "" };

function input(over: Partial<HppInput> = {}): HppInput {
  return {
    jenisCetakan: "Paperbag",
    qtyOrder: 5_000,
    jenisKertas: "Art paper",
    gramatur: 150,
    planoP: 79,
    planoL: 109,
    cetakP: 36,
    cetakL: 26,
    isiPlanoManual: null,
    jumlah: 20_000,
    layout: null,
    hargaKertas: 3_500,
    ukuranPlat: "58",
    hargaPlat: null,
    jumlahPlatManual: null,
    mesin: "58",
    jenisCetak: "separasi",
    ongkosCetak: 500_000,
    laminasi: "tidak",
    tarifLaminasi: null,
    sisiLaminasi: 1,
    pisau: null,
    plong: null,
    jasaPotong: null,
    finishing: null,
    tali: { ...addOnOff, jenis: "" },
    kertasAlas: addOnOff,
    kertasKuping: addOnOff,
    lem: addOnOff,
    ...over,
  };
}

const nilai = (r: ReturnType<typeof hitungHpp>, key: string) =>
  r.rincian.find((x) => x.key === key)?.nilai;

describe("kalkulasi plano", () => {
  it("79×109 dengan 36×26 → 1/8", () => {
    expect(kalkulasiPlano(79, 109, 36, 26)).toBe(8);
    expect(hitungHpp(input()).isiPlanoRotasi).toBe(9);
  });

  it("kertas cetak lebih besar dari plano → 0 dan error", () => {
    const r = hitungHpp(input({ cetakP: 90 }));
    expect(r.isiPlano).toBe(0);
    expect(r.jumlahPlano).toBe(0);
    expect(r.errors).toContain("Kertas cetak lebih besar dari plano, tidak muat satu pun.");
  });

  it("override manual isi plano", () => {
    expect(hitungHpp(input({ isiPlanoManual: 9 })).jumlahPlano).toBe(2223);
  });
});

describe("jumlah plano & modal kertas", () => {
  it("20.000 / 8 = 2.500 plano", () => {
    const r = hitungHpp(input());
    expect(r.jumlahPlano).toBe(2500);
    expect(nilai(r, "kertas")).toBe(2500 * 3500);
  });

  it("dengan layout 1/4: 20.000 / 4 / 8 = 625 plano", () => {
    const r = hitungHpp(input({ layout: 4 }));
    expect(r.lembarCetak).toBe(5000);
    expect(r.jumlahPlano).toBe(625);
  });

  it("dibulatkan ke atas", () => {
    expect(hitungHpp(input({ jumlah: 20_001 })).jumlahPlano).toBe(2501);
  });
});

describe("plat", () => {
  it("separasi, plat 58 = 4 × 40.000", () => {
    expect(nilai(hitungHpp(input()), "plat")).toBe(160_000);
  });

  it("plat 52, spot = 1 × 25.000", () => {
    const r = hitungHpp(input({ ukuranPlat: "52", jenisCetak: "spot" }));
    expect(r.jumlahPlat).toBe(1);
    expect(nilai(r, "plat")).toBe(25_000);
  });

  it("jenis cetak 'tidak' → tanpa plat", () => {
    expect(nilai(hitungHpp(input({ jenisCetak: "tidak" })), "plat")).toBe(0);
  });

  it("jumlah plat manual", () => {
    expect(nilai(hitungHpp(input({ jumlahPlatManual: 2 })), "plat")).toBe(80_000);
  });
});

describe("laminasi", () => {
  it("doff 1 sisi = 0,22 × 936 × 20.000", () => {
    expect(nilai(hitungHpp(input({ laminasi: "doff" })), "laminasi")).toBe(4_118_400);
  });

  it("doff 2 sisi", () => {
    const r = hitungHpp(input({ laminasi: "doff", sisiLaminasi: 2 }));
    expect(nilai(r, "laminasi")).toBe(8_236_800);
  });

  it("glossy 1 sisi = 0,20 × 936 × 20.000", () => {
    expect(nilai(hitungHpp(input({ laminasi: "glossy" })), "laminasi")).toBe(3_744_000);
  });

  it("tidak laminasi → tidak ada baris", () => {
    expect(nilai(hitungHpp(input()), "laminasi")).toBeUndefined();
  });
});

describe("biaya lain & total", () => {
  it("add-on nonaktif = 0, aktif default qty = jumlah cetak", () => {
    const off = hitungHpp(input());
    expect(nilai(off, "tali")).toBeUndefined();
    const on = hitungHpp(input({ tali: { aktif: true, harga: 300, qty: null, jenis: "Kur", catatan: "hitam 40 cm" } }));
    expect(nilai(on, "tali")).toBe(1_500_000); // 5.000 qty order × 300
    expect(on.rincian.find((x) => x.key === "tali")?.rumus).toContain("hitam 40 cm");
  });

  it("total dan HPP per pcs", () => {
    const r = hitungHpp(input({ pisau: 350_000, finishing: 150_000 }));
    const total = 2500 * 3500 + 160_000 + 500_000 + 350_000 + 150_000;
    expect(r.total).toBe(total);
    expect(r.perPcs).toBe(total / 5_000);
  });

  it("harga jual markup 30%–50% dari HPP per pcs", () => {
    const r = hitungHpp(input());
    expect(r.hargaJual.map((h) => h.persen)).toEqual([30, 35, 40, 45, 50]);
    expect(r.hargaJual[0].perPcs).toBeCloseTo(r.perPcs * 1.3);
    expect(r.hargaJual[4].total).toBeCloseTo(r.perPcs * 1.5 * 5_000);
  });
});

describe("validasi", () => {
  it("field wajib kosong tidak menghasilkan NaN", () => {
    const r = hitungHpp(input({ planoP: null, jumlah: null, qtyOrder: null }));
    expect(r.errors).toContain("Quantity order wajib diisi.");
    expect(r.errors).toContain("Ukuran plano wajib diisi.");
    expect(r.errors).toContain("Jumlah kertas cetak wajib diisi.");
    expect(Number.isNaN(r.total)).toBe(false);
    expect(r.perPcs).toBe(0);
  });

  it("nilai negatif ditolak", () => {
    expect(hitungHpp(input({ hargaKertas: -1 })).errors).toContain("Harga kertas tidak boleh negatif.");
  });
});

describe("parseAngka", () => {
  it.each([
    ["20.000", 20000],
    ["0,22", 0.22],
    ["0.22", 0.22],
    ["1.250,5", 1250.5],
    ["Rp 25.000", 25000],
    ["", null],
    ["abc", null],
  ])("%s → %s", (raw, hasil) => {
    expect(parseAngka(raw)).toBe(hasil);
  });
});
