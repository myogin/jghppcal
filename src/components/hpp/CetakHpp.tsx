import { Fragment } from "react";
import { angka, rupiah } from "@/lib/format";
import type { HppInput, HppResult } from "@/lib/hpp";
import { JENIS_CETAK, LAMINASI } from "@/lib/presets";

const hargaPcs = (n: number) => (n > 0 && n < 1000 ? `Rp ${angka(n)}` : rupiah(n));
const ukuran = (p: number | null, l: number | null) => (p && l ? `${angka(p)} × ${angka(l)} cm` : "–");

/** Laporan HPP yang hanya tampil saat print / simpan PDF. */
export function CetakHpp({ input, hasil, tanggal }: { input: HppInput; hasil: HppResult; tanggal: string }) {
  const spek: [string, string][] = [
    ["Jenis kertas", [input.jenisKertas, input.gramatur && `${angka(input.gramatur)} gsm`].filter(Boolean).join(" ") || "–"],
    ["Ukuran plano", ukuran(input.planoP, input.planoL)],
    ["Ukuran kertas cetak", ukuran(input.cetakP, input.cetakL)],
    ["Isi per plano", hasil.isiPlano ? `1/${hasil.isiPlano}` : "–"],
    ["Jumlah kertas cetak", angka(input.jumlah ?? 0)],
    ["Plat / layout", input.layout && input.layout > 1 ? `1/${angka(input.layout)}` : "–"],
    ["Lembar cetak", angka(hasil.lembarCetak)],
    ["Jumlah plano", angka(hasil.jumlahPlano)],
    ["Plat", `${input.ukuranPlat}, ${angka(hasil.jumlahPlat)} plat`],
    ["Ongkos cetak", `Mesin ${input.mesin}, ${JENIS_CETAK[input.jenisCetak].label}`],
    ["Laminasi", input.laminasi === "tidak" ? "Tidak" : `${LAMINASI[input.laminasi].label} ${input.sisiLaminasi} sisi`],
  ];

  const th = "border-b border-zinc-400 py-1 text-left font-semibold";
  const td = "border-b border-zinc-200 py-1 align-top";

  return (
    <div className="hidden text-[10pt] leading-snug text-black print:block">
      <header className="mb-5 flex items-end justify-between border-b-2 border-black pb-2">
        <div>
          <h1 className="text-xl font-bold">Harga Pokok Produksi Cetak</h1>
          <p className="text-sm">
            {[input.jenisCetakan || "Tanpa nama", hasil.qtyOrder > 0 && `${angka(hasil.qtyOrder)} pcs`]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {/* eslint-disable-next-line @next/next/no-img-element -- next/image tidak perlu untuk gambar print statis */}
          <img src="/logo-jayagrafika.png" alt="Jaya Grafika" className="h-[14mm] w-auto" />
          <p className="text-sm">{tanggal}</p>
        </div>
      </header>

      <section className="mb-5 break-inside-avoid">
        <h2 className="mb-1 font-bold">Spesifikasi</h2>
        <table className="w-full">
          <tbody>
            {Array.from({ length: Math.ceil(spek.length / 2) }, (_, i) => spek.slice(i * 2, i * 2 + 2)).map((baris) => (
              <tr key={baris[0][0]}>
                {baris.map(([k, v]) => (
                  <Fragment key={k}>
                    <td className={`${td} w-[22%] whitespace-nowrap pr-3 text-zinc-600`}>{k}</td>
                    <td className={`${td} w-[28%] pr-4`}>{v}</td>
                  </Fragment>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mb-5 break-inside-avoid">
        <h2 className="mb-1 font-bold">Rincian biaya</h2>
        <table className="w-full">
          <thead>
            <tr>
              <th className={th}>Komponen</th>
              <th className={th}>Perhitungan</th>
              <th className={`${th} text-right`}>Biaya</th>
            </tr>
          </thead>
          <tbody>
            {hasil.rincian.map((r) => (
              <tr key={r.key}>
                <td className={td}>{r.label}</td>
                <td className={`${td} text-zinc-600`}>{r.rumus}</td>
                <td className={`${td} text-right tabular-nums`}>{rupiah(r.nilai)}</td>
              </tr>
            ))}
            <tr className="font-bold">
              <td className="py-1.5" colSpan={2}>Total HPP</td>
              <td className="py-1.5 text-right tabular-nums">{rupiah(hasil.total)}</td>
            </tr>
            <tr className="font-bold">
              <td className="py-1.5" colSpan={2}>
                HPP per pcs ({rupiah(hasil.total)} / {angka(hasil.qtyOrder)} pcs)
              </td>
              <td className="py-1.5 text-right tabular-nums">{hargaPcs(hasil.perPcs)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="break-inside-avoid">
        <h2 className="mb-1 font-bold">Harga jual</h2>
        <table className="w-full">
          <thead>
            <tr>
              <th className={th}>Markup</th>
              <th className={`${th} text-right`}>Per pcs</th>
              <th className={`${th} text-right`}>Total ({angka(hasil.qtyOrder)} pcs)</th>
            </tr>
          </thead>
          <tbody>
            {hasil.hargaJual.map((h) => (
              <tr key={h.persen}>
                <td className={td}>+{h.persen}%</td>
                <td className={`${td} text-right tabular-nums`}>{hargaPcs(h.perPcs)}</td>
                <td className={`${td} text-right tabular-nums`}>{rupiah(h.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-1 text-xs text-zinc-600">Harga jual = HPP per pcs × (1 + markup).</p>
      </section>

      {hasil.errors.length > 0 && (
        <p className="mt-4 text-sm">Catatan: {hasil.errors.join(" ")}</p>
      )}
    </div>
  );
}
