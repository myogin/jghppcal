import type { ReactNode } from "react";

export function Section({ judul, children }: { judul: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {judul}
      </h2>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </section>
  );
}

const inputCls =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100";

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  satuan?: string;
  hint?: ReactNode;
  lebar?: boolean; // ambil 2 kolom
  angka?: boolean;
}

export function Field({ label, value, onChange, placeholder, satuan, hint, lebar, angka = true }: FieldProps) {
  return (
    <label className={`flex flex-col gap-1 ${lebar ? "col-span-2" : ""}`}>
      <span className="text-sm text-zinc-700 dark:text-zinc-300">
        {label}
        {satuan && <span className="text-zinc-400"> ({satuan})</span>}
      </span>
      <input
        className={inputCls}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={angka ? "decimal" : "text"}
      />
      {hint && <span className="text-xs text-zinc-500 dark:text-zinc-400">{hint}</span>}
    </label>
  );
}

interface SelectProps<T extends string> {
  label: string;
  value: T;
  onChange: (v: T) => void;
  opsi: { value: T; label: string }[];
  lebar?: boolean;
}

export function Select<T extends string>({ label, value, onChange, opsi, lebar }: SelectProps<T>) {
  return (
    <label className={`flex flex-col gap-1 ${lebar ? "col-span-2" : ""}`}>
      <span className="text-sm text-zinc-700 dark:text-zinc-300">{label}</span>
      <select className={inputCls} value={value} onChange={(e) => onChange(e.target.value as T)}>
        {opsi.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

interface PilihanProps<T extends string | number> {
  label: string;
  value: T;
  onChange: (v: T) => void;
  opsi: { value: T; label: string }[];
  lebar?: boolean;
}

/** Tombol segmented untuk pilihan singkat (mis. 1 / 2 sisi). */
export function Pilihan<T extends string | number>({ label, value, onChange, opsi, lebar }: PilihanProps<T>) {
  return (
    <div className={`flex flex-col gap-1 ${lebar ? "col-span-2" : ""}`}>
      <span className="text-sm text-zinc-700 dark:text-zinc-300">{label}</span>
      <div role="radiogroup" aria-label={label} className="flex rounded-lg border border-zinc-300 p-0.5 dark:border-zinc-700">
        {opsi.map((o) => (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            onClick={() => onChange(o.value)}
            className={`flex-1 rounded-md px-2 py-1.5 text-sm ${
              value === o.value
                ? "bg-blue-600 font-medium text-white"
                : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
  lebar,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  lebar?: boolean;
}) {
  return (
    <label className={`flex items-center gap-2 py-1 text-sm text-zinc-700 dark:text-zinc-300 ${lebar ? "col-span-2" : ""}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-blue-600"
      />
      {label}
    </label>
  );
}
