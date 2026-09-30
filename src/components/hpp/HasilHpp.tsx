import { angka, rupiah } from "@/lib/format";
import type { HppResult } from "@/lib/hpp";

// Harga per pcs tampil tanpa desimal kecuali di bawah Rp1.000.
const hargaPcs = (n: number) => (n > 0 && n < 1000 ? `Rp ${angka(n)}` : rupiah(n));

export function HasilHpp({ hasil, jenisCetakan }: { hasil: HppResult; jenisCetakan: string }) {
  const siap = hasil.errors.length === 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl bg-blue-600 p-5 text-white">
        {(jenisCetakan || hasil.qtyOrder > 0) && (
          <div className="mb-2 text-sm font-medium">
            {[jenisCetakan, hasil.qtyOrder > 0 && `${angka(hasil.qtyOrder)} pcs`].filter(Boolean).join(" · ")}
          </div>
        )}
        <div className="text-sm opacity-80">Total HPP</div>
        <div className="text-3xl font-bold tabular-nums">{rupiah(hasil.total)}</div>
        <div className="mt-3 flex items-baseline justify-between border-t border-white/20 pt-3">
          <span className="text-sm opacity-80">HPP per pcs</span>
          <span className="text-xl font-semibold tabular-nums">{hargaPcs(hasil.perPcs)}</span>
        </div>
      </div>

      {!siap && (
        <ul className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
          {hasil.errors.map((e) => (
            <li key={e}>• {e}</li>
          ))}
        </ul>
      )}

      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          ["Isi plano", hasil.isiPlano ? `1/${hasil.isiPlano}` : "–"],
          ["Lembar cetak", angka(hasil.lembarCetak)],
          ["Jumlah plano", angka(hasil.jumlahPlano)],
        ].map(([label, nilai]) => (
          <div key={label} className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="text-xs text-zinc-500 dark:text-zinc-400">{label}</div>
            <div className="text-lg font-semibold tabular-nums">{nilai}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="border-b border-zinc-200 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          Harga jual
        </h2>
        <table className="w-full text-sm">
          <thead className="text-xs text-zinc-500 dark:text-zinc-400">
            <tr>
              <th className="px-4 pt-3 pb-1 text-left font-normal">Markup</th>
              <th className="px-4 pt-3 pb-1 text-right font-normal">Per pcs</th>
              <th className="px-4 pt-3 pb-1 text-right font-normal">Total</th>
            </tr>
          </thead>
          <tbody>
            {hasil.hargaJual.map((h) => (
              <tr key={h.persen} className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2.5 font-medium">+{h.persen}%</td>
                <td className="px-4 py-2.5 text-right font-semibold tabular-nums">{hargaPcs(h.perPcs)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums text-zinc-600 dark:text-zinc-300">{rupiah(h.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="px-4 pt-1 pb-3 text-xs text-zinc-500 dark:text-zinc-400">Harga jual = HPP per pcs × (1 + markup).</p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="border-b border-zinc-200 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          Rincian biaya
        </h2>
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {hasil.rincian.map((r) => (
            <li key={r.key} className="flex items-start justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <div className="text-sm font-medium">{r.label}</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">{r.rumus}</div>
              </div>
              <div className="shrink-0 text-sm font-semibold tabular-nums">{rupiah(r.nilai)}</div>
            </li>
          ))}
          <li className="flex justify-between px-4 py-3 font-semibold">
            <span>Total</span>
            <span className="tabular-nums">{rupiah(hasil.total)}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
