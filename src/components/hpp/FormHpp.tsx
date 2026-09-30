"use client";

import { angka, parseAngka } from "@/lib/format";
import type { HppResult } from "@/lib/hpp";
import { JENIS_CETAK, LAMINASI, PLAT, PRESET_PLANO, type JenisCetak, type JenisLaminasi, type Mesin, type Sisi, type UkuranPlat } from "@/lib/presets";
import { Field, Pilihan, Section, Select, Toggle } from "./fields";
import type { AddOnForm, FormState } from "./state";

type Set = <K extends keyof FormState>(key: K, value: FormState[K]) => void;

const MESIN: { value: Mesin; label: string }[] = [
  { value: "52", label: "52" },
  { value: "58", label: "58" },
];

const SISI = [
  { value: 1 as Sisi, label: "1 sisi" },
  { value: 2 as Sisi, label: "2 sisi" },
];

export function FormHpp({ form, set, hasil }: { form: FormState; set: Set; hasil: HppResult }) {
  const addOn = (key: "tali" | "kertasAlas" | "kertasKuping" | "lem", patch: Partial<AddOnForm>) =>
    set(key, { ...form[key], ...patch });

  const qtyDefault = parseAngka(form.qtyOrder) || parseAngka(form.jumlah) || 0;
  const qtyHint = `Kosong = quantity order (${angka(qtyDefault)})`;

  return (
    <div className="flex flex-col gap-4">
      <Section judul="Order">
        <Field
          label="Jenis cetakan"
          value={form.jenisCetakan}
          onChange={(v) => set("jenisCetakan", v)}
          placeholder="Paperbag / brosur / box"
          angka={false}
        />
        <Field
          label="Quantity order"
          satuan="pcs"
          value={form.qtyOrder}
          onChange={(v) => set("qtyOrder", v)}
          placeholder="5.000"
          hint="Dipakai untuk HPP per pcs."
        />
      </Section>

      <Section judul="Kertas">
        <Field label="Jenis kertas" value={form.jenisKertas} onChange={(v) => set("jenisKertas", v)} placeholder="Art paper" angka={false} />
        <Field label="Gramatur" satuan="gsm" value={form.gramatur} onChange={(v) => set("gramatur", v)} placeholder="150" />
        <Field
          label="Harga kertas per plano"
          satuan="Rp"
          value={form.hargaKertas}
          onChange={(v) => set("hargaKertas", v)}
          placeholder="3.500"
          lebar
          hint="Masukkan harga terbaru."
        />
      </Section>

      <Section judul="Ukuran & plano">
        <div className="col-span-2 flex flex-wrap gap-2">
          {PRESET_PLANO.map(({ p, l }) => {
            const aktif = form.planoP === String(p) && form.planoL === String(l);
            return (
              <button
                key={`${p}x${l}`}
                type="button"
                onClick={() => {
                  set("planoP", String(p));
                  set("planoL", String(l));
                }}
                className={`rounded-full border px-3 py-1 text-sm ${
                  aktif
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                {p}×{l}
              </button>
            );
          })}
        </div>
        <Field label="Plano P" satuan="cm" value={form.planoP} onChange={(v) => set("planoP", v)} />
        <Field label="Plano L" satuan="cm" value={form.planoL} onChange={(v) => set("planoL", v)} />
        <Field label="Kertas cetak P" satuan="cm" value={form.cetakP} onChange={(v) => set("cetakP", v)} placeholder="36" />
        <Field label="Kertas cetak L" satuan="cm" value={form.cetakL} onChange={(v) => set("cetakL", v)} placeholder="26" />
        <Field
          label="Isi per plano"
          value={form.isiPlanoManual}
          onChange={(v) => set("isiPlanoManual", v)}
          placeholder={hasil.isiPlanoAuto ? `Auto: ${hasil.isiPlanoAuto}` : "Auto"}
          hint={
            hasil.isiPlanoRotasi > hasil.isiPlanoAuto
              ? `Auto 1/${hasil.isiPlanoAuto}. Kalau diputar bisa 1/${hasil.isiPlanoRotasi}.`
              : "Kosongkan untuk hitung otomatis."
          }
          lebar
        />
        <Field label="Jumlah kertas cetak" value={form.jumlah} onChange={(v) => set("jumlah", v)} placeholder="20.000" />
        <Field
          label="Plat / layout 1/…"
          value={form.layout}
          onChange={(v) => set("layout", v)}
          placeholder="Opsional, mis. 4"
          hint="Contoh 4 → jumlah / 4 / isi plano"
        />
      </Section>

      <Section judul="Plat">
        <Select
          label="Ukuran plat"
          value={form.ukuranPlat}
          onChange={(v: UkuranPlat) => set("ukuranPlat", v)}
          opsi={(Object.keys(PLAT) as UkuranPlat[]).map((u) => ({
            value: u,
            label: `${u} | ${angka(PLAT[u].harga)}`,
          }))}
          lebar
        />
        <Field
          label="Harga plat"
          satuan="Rp"
          value={form.hargaPlat}
          onChange={(v) => set("hargaPlat", v)}
          placeholder={angka(PLAT[form.ukuranPlat].harga)}
        />
        <Field
          label="Jumlah plat"
          value={form.jumlahPlatManual}
          onChange={(v) => set("jumlahPlatManual", v)}
          placeholder={`Auto: ${hasil.jumlahPlat}`}
        />
      </Section>

      <Section judul="Ongkos cetak">
        <Pilihan label="Jenis mesin" value={form.mesin} onChange={(v) => set("mesin", v)} opsi={MESIN} lebar />
        <Select
          label="Jenis cetak"
          value={form.jenisCetak}
          onChange={(v: JenisCetak) => set("jenisCetak", v)}
          opsi={(Object.keys(JENIS_CETAK) as JenisCetak[]).map((j) => ({ value: j, label: JENIS_CETAK[j].label }))}
          lebar
        />
        <Field label="Harga ongkos cetak" satuan="Rp" value={form.ongkosCetak} onChange={(v) => set("ongkosCetak", v)} placeholder="0" lebar />
      </Section>

      <Section judul="Laminasi">
        <Pilihan
          label="Jenis"
          value={form.laminasi}
          onChange={(v: JenisLaminasi) => set("laminasi", v)}
          opsi={(Object.keys(LAMINASI) as JenisLaminasi[]).map((l) => ({ value: l, label: LAMINASI[l].label }))}
          lebar
        />
        {form.laminasi !== "tidak" && (
          <>
            <Field
              label="Tarif"
              satuan="Rp/cm²"
              value={form.tarifLaminasi}
              onChange={(v) => set("tarifLaminasi", v)}
              placeholder={angka(LAMINASI[form.laminasi].tarif)}
            />
            <Pilihan label="Sisi" value={form.sisiLaminasi} onChange={(v) => set("sisiLaminasi", v)} opsi={SISI} />
          </>
        )}
      </Section>

      <Section judul="Pisau, plong, potong & finishing">
        <Field label="Pisau" satuan="Rp" value={form.pisau} onChange={(v) => set("pisau", v)} placeholder="0" />
        <Field label="Plong" satuan="Rp" value={form.plong} onChange={(v) => set("plong", v)} placeholder="0" />
        <Field label="Jasa potong" satuan="Rp" value={form.jasaPotong} onChange={(v) => set("jasaPotong", v)} placeholder="0" />
        <Field label="Finishing" satuan="Rp" value={form.finishing} onChange={(v) => set("finishing", v)} placeholder="0" />
      </Section>

      <Section judul="Add-on (opsional)">
        <Toggle label="Tali paperbag" checked={form.tali.aktif} onChange={(v) => addOn("tali", { aktif: v })} lebar />
        {form.tali.aktif && (
          <>
            <Field label="Jenis tali" value={form.taliJenis} onChange={(v) => set("taliJenis", v)} placeholder="Kur / katun / pita" angka={false} lebar />
            <Field label="Harga tali" satuan="Rp/pcs" value={form.tali.harga} onChange={(v) => addOn("tali", { harga: v })} />
            <Field label="Qty" value={form.tali.qty} onChange={(v) => addOn("tali", { qty: v })} placeholder="Auto" hint={qtyHint} />
            <Field label="Note" value={form.tali.catatan} onChange={(v) => addOn("tali", { catatan: v })} placeholder="Warna, panjang, dll." angka={false} lebar />
          </>
        )}
        {(
          [
            ["kertasAlas", "Kertas alas"],
            ["kertasKuping", "Kertas kuping"],
            ["lem", "Lem"],
          ] as const
        ).map(([key, label]) => (
          <div key={key} className="col-span-2 grid grid-cols-2 gap-3">
            <Toggle label={label} checked={form[key].aktif} onChange={(v) => addOn(key, { aktif: v })} lebar />
            {form[key].aktif && (
              <>
                <Field label={`Harga ${label.toLowerCase()}`} satuan="Rp/pcs" value={form[key].harga} onChange={(v) => addOn(key, { harga: v })} />
                <Field label="Qty" value={form[key].qty} onChange={(v) => addOn(key, { qty: v })} placeholder="Auto" hint={qtyHint} />
                {key !== "lem" && (
                  <Field label="Note" value={form[key].catatan} onChange={(v) => addOn(key, { catatan: v })} placeholder="Bahan, ukuran, dll." angka={false} lebar />
                )}
              </>
            )}
          </div>
        ))}
      </Section>
    </div>
  );
}
