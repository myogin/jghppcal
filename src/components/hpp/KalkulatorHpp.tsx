"use client";

import { useEffect, useMemo, useState } from "react";
import { angka, rupiah } from "@/lib/format";
import { hitungHpp } from "@/lib/hpp";
import { CetakHpp } from "./CetakHpp";
import { FormHpp } from "./FormHpp";
import { HasilHpp } from "./HasilHpp";
import { FORM_AWAL, type FormState, toInput } from "./state";

const STORAGE_KEY = "hpp-cetak:v3";

export function KalkulatorHpp() {
  const [form, setForm] = useState<FormState>(FORM_AWAL);
  const [dimuat, setDimuat] = useState(false);
  const [tanggal, setTanggal] = useState("");

  // Ambil input terakhir setelah mount (localStorage tidak ada di server).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sekali saat mount
      if (raw) setForm({ ...FORM_AWAL, ...JSON.parse(raw) });
    } catch {
      // storage diblokir atau data rusak: pakai form awal
    }
    setDimuat(true);
    setTanggal(new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }));
  }, []);

  useEffect(() => {
    if (!dimuat) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    } catch {
      // abaikan
    }
  }, [form, dimuat]);

  const input = useMemo(() => toInput(form), [form]);
  const hasil = useMemo(() => hitungHpp(input), [input]);

  // Judul dokumen dipakai browser sebagai nama file PDF.
  const cetak = () => {
    const judulAsli = document.title;
    const nama = [input.jenisCetakan || "HPP Cetak", hasil.qtyOrder > 0 && `${angka(hasil.qtyOrder)} pcs`]
      .filter(Boolean)
      .join(" ");
    document.title = `HPP ${nama}`.replace(/^HPP HPP/, "HPP");
    window.print();
    document.title = judulAsli;
  };

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <>
      <div className="mx-auto w-full max-w-6xl px-4 pt-6 pb-24 lg:pb-6 print:hidden">
        <header className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Kalkulator HPP Cetak</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Hasil dihitung ulang setiap input berubah.</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={cetak}
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Print / PDF
            </button>
            <button
              type="button"
              onClick={() => setForm(FORM_AWAL)}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Reset
            </button>
          </div>
        </header>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
          <FormHpp form={form} set={set} hasil={hasil} />
          <aside id="hasil" className="scroll-mt-4 lg:sticky lg:top-6 lg:self-start">
            <HasilHpp hasil={hasil} jenisCetakan={form.jenisCetakan.trim()} />
          </aside>
        </div>
        <a
          href="#hasil"
          className="fixed inset-x-0 bottom-0 flex items-center justify-between bg-blue-600 px-4 py-3 text-white shadow-lg lg:hidden"
        >
          <span className="text-sm opacity-80">Total HPP · lihat rincian ↓</span>
          <span className="text-lg font-bold tabular-nums">{rupiah(hasil.total)}</span>
        </a>
      </div>
      <CetakHpp input={input} hasil={hasil} tanggal={tanggal} />
    </>
  );
}
