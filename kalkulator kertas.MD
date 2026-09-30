# PRD — Web Kalkulator Kertas

Sep 30, 2026 · @Backend Team

## Analisa web referensi

[Hitung Kertas — PIXELINDIE](https://pixelindie.com/hitungkertas/) adalah kalkulator cetak gratis satu halaman dengan modul dalam tab. PRD ini mengadopsi tiga modulnya untuk dipakai satu perusahaan:

| Modul | Input utama | Output | Catatan |
| --- | --- | --- | --- |
| Layout Cetak | Ukuran kertas (preset A3+ 48×32, A3, A4, A5, custom), ukuran desain, bleed/jarak, jumlah, opsi rotasi | pcs per lembar, susunan kol × baris, lembar dibutuhkan, % area terbuang, preview visual per lembar | Bisa simpan ukuran custom; toggle estimasi harga (harga per rim, isi rim, margin waste %) |
| Kalkulator Buku | Ukuran kertas cetak, ukuran buku jadi (A4, A5, A6, 17×24, custom), jumlah halaman, eksemplar, duplex/satu sisi, jenis cover, tebal punggung, jenis jilid | Buku per lembar (up), halaman final dibulatkan, lembar isi per buku, cover per lembar, total lembar + waste 5%, rekomendasi order | Model step-and-repeat; lebar cover lipatan dihitung dari tebal punggung |
| Potong Plano | Ukuran plano (preset 65×100, 79×109, 61×86, 72×102), ukuran potongan | Kol × baris (dengan rotasi), jumlah potongan, % waste, visualisasi potongan | Opsi “maksimalkan sisa potongan” memakai strip sisa |

Kelebihan yang layak ditiru:

- Hasil langsung terlihat tanpa tombol “Hitung”, dengan kalimat penjelasan rumus di bawah hasil.
- Istilah lapangan percetakan (up, run, plano, bleed, rim) sehingga terasa dibuat oleh orang percetakan.

Celah yang bisa jadi pembeda:

- Bug tampilan: teks sisa potongan menampilkan “9.6×undefined”.
- Tidak ada ekspor hasil (PDF/gambar) atau link berbagi perhitungan.
- Harga hanya kertas; belum ada biaya cetak, finishing, dan margin untuk penawaran ke klien.
- Preset dan harga generik, bukan milik satu perusahaan.

## Masalah & tujuan

Tim perusahaan masih menghitung kebutuhan kertas, imposisi, dan harga secara manual di kalkulator atau Excel, sehingga sering salah order kertas dan penawaran tidak seragam antar staf. Produk ini menjadi kalkulator cetak web milik perusahaan dengan preset, harga, dan brand sendiri.

Tujuan produk:

1. Menghitung layout, kebutuhan kertas buku, dan potong plano dalam satu web, hasil keluar kurang dari 1 detik setelah input berubah.
2. Semua staf memakai rumus, preset kertas, dan harga yang sama dari satu sumber (panel admin).
3. Hasil bisa diekspor dan dibagikan (PDF berlogo perusahaan, gambar, link) ke pelanggan atau tim produksi.
4. Pelanggan bisa menghitung sendiri lalu langsung order ke WhatsApp perusahaan.

Bukan tujuan pada versi ini: estimasi waktu pengerjaan, sistem order online penuh, pembayaran, dan manajemen produksi (MIS/ERP).

## Target pengguna

| Persona | Kebutuhan utama | Modul yang paling dipakai |
| --- | --- | --- |
| Admin / CS perusahaan | Cepat hitung up per lembar dan harga untuk menjawab pelanggan | Layout Cetak, Estimasi Harga |
| Operator produksi | Tahu jumlah kertas yang harus disiapkan dan skema potong plano | Potong Plano, Kalkulator Buku |
| Pemilik / manajer | Mengatur preset, harga kertas, dan memastikan penawaran seragam | Panel admin |
| Pelanggan (desainer, penerbit, UMKM) | Cek kebutuhan cetak sendiri lalu order | Layout Cetak, Kalkulator Buku |

Sebagian besar diakses dari HP di area produksi, jadi desain mobile-first adalah wajib.

## Ruang lingkup fitur

MVP mencakup 3 modul referensi plus harga, ekspor, dan link berbagi; fase berikutnya menambah biaya lengkap dan akun staf.

| ID | Fitur | Prioritas | Fase |
| --- | --- | --- | --- |
| F1 | Layout Cetak (imposisi desain per lembar + preview) | P0 | MVP |
| F2 | Kalkulator Buku (isi + cover + waste) | P0 | MVP |
| F3 | Potong Plano (kol × baris, rotasi, visualisasi) | P0 | MVP |
| F4 | Estimasi harga kertas (harga per rim, waste %) | P0 | MVP |
| F5 | Preset ukuran perusahaan + simpan ukuran custom (lokal di browser) | P1 | MVP |
| F6 | Link berbagi (state di URL) + ekspor PDF/PNG berlogo perusahaan | P1 | MVP |
| F7 | Panel admin: preset kertas, ukuran plano, harga | P1 | MVP |
| F8 | CTA order via WhatsApp perusahaan dengan ringkasan hasil terisi otomatis | P1 | MVP |
| F9 | Estimasi biaya lengkap: cetak per klik, finishing, margin, PPN | P2 | Fase 2 |
| F10 | Potong plano dengan pemanfaatan sisa (skema campuran) | P2 | Fase 2 |
| F11 | Login staf, riwayat perhitungan, template penawaran PDF | P2 | Fase 2 |
| F12 | Satuan mm/cm/inci dan bahasa Inggris | P3 | Fase 3 |

## Kebutuhan fungsional & rumus

Semua perhitungan berjalan di browser (client-side), dihitung ulang setiap input berubah, dan setiap hasil disertai satu kalimat penjelasan rumus.

### F1 — Layout Cetak

- Input: kertas W×H (preset/custom), desain w×h, bleed/jarak b, margin tepi m (baru), jumlah Q (opsional), mode rotasi.
- Hitung dua orientasi, pilih yang memberi pcs terbanyak bila rotasi aktif:

```latex
\text{kol} = \left\lfloor \frac{W - 2m + b}{w + b} \right\rfloor,\quad \text{baris} = \left\lfloor \frac{H - 2m + b}{h + b} \right\rfloor,\quad \text{pcs} = \text{kol} \times \text{baris}
```

```latex
\text{lembar} = \left\lceil \frac{Q}{\text{pcs}} \right\rceil,\quad \text{waste} = 1 - \frac{\text{pcs} \times w \times h}{W \times H}
```

- Fase 2: layout campuran (sebagian diputar di sisa area) untuk menambah pcs.
- Output: pcs/lembar, kol × baris, lembar dibutuhkan, % waste, preview SVG dengan paginasi lembar.

### F2 — Kalkulator Buku

- Input: kertas cetak, ukuran buku jadi, halaman P, eksemplar E, duplex/satu sisi, cover (soft/hard/tanpa), tebal punggung s, jilid (perfect/saddle/spiral).
- Pembulatan halaman: saddle stitch wajib kelipatan 4; perfect binding kelipatan 2 (disarankan 4).
- Up = pcs dari rumus F1 dengan ukuran buku jadi; lembar isi per buku = P ÷ 2 (duplex) atau P (satu sisi).

```latex
\text{run} = \left\lceil \frac{E}{\text{up}} \right\rceil,\quad \text{lembar isi} = \text{run} \times \text{lembar per buku}
```

- Cover lipatan = (2 × lebar buku + s + 2 × bleed) × (tinggi buku + 2 × bleed); hard cover menambah lipatan board. Catatan: referensi menghitung cover A5 sebagai 42.8×14.8 cm (orientasi tertukar); pastikan lebar buku dipakai untuk bentangan.
- Total = lembar isi + lembar cover + waste (default 5%, bisa diubah) → rekomendasi order dibulatkan ke atas.
- Estimasi tebal punggung otomatis dari gramatur: 100 hlm × 80 gsm ≈ 0.8 cm (tabel gramatur di admin).

### F3 — Potong Plano

- Input: plano (65×100, 79×109, 61×86, 72×102, custom) dan ukuran potongan.
- Rumus kol × baris sama dengan F1 (tanpa bleed), kedua orientasi.
- Output: jumlah potongan, % waste, ukuran strip sisa (kanan dan bawah) dengan nilai valid, visualisasi garis potong.
- Fase 2: “maksimalkan sisa” — isi strip sisa dengan potongan terputar (guillotine 2 tahap).

### F4 — Estimasi harga

- MVP: harga per rim, isi rim (500), margin waste %, → harga per lembar dan total kertas.
- Fase 2: + biaya klik cetak (per sisi, warna/BW), finishing per lembar/setup, margin keuntungan %, PPN, pembulatan harga.

### Fitur pendukung

- Simpan ukuran custom di localStorage; preset global dikelola admin.
- Seluruh input tersimpan di query string URL → tombol “Salin link” membuka perhitungan yang sama.
- Ekspor PDF/PNG berisi ringkasan input, hasil, dan preview layout.
- Tombol “Order via WhatsApp” mengisi pesan otomatis dengan ringkasan hasil.
- Validasi: desain lebih besar dari kertas, nilai nol/negatif, dan field kosong menampilkan pesan jelas, tidak pernah “undefined” atau NaN.

## UX/UI & non-fungsional

Prinsip UI:

Alur inti: pilih tab modul → pilih preset atau isi custom → hasil dan preview langsung berubah → salin link, ekspor, atau order via WhatsApp.

Prinsip UI:

- Satu halaman dengan tab  (Layout Cetak, Kalkulator Buku, Potong Plano), tab terakhir diingat per perangkat.
- Logo, warna, dan kontak perusahaan di header dan di PDF ekspor.
- Preset sebagai chip yang bisa diketuk; input angka dengan keyboard numerik di HP dan satuan tertulis di label.
- Kartu hasil besar (angka utama) + kalimat penjelasan rumus + preview SVG yang responsif.
- Tombol mengambang Order/Chat WhatsApp perusahaan yang tidak menutupi hasil.
- Mode terang dan gelap; kontras teks sesuai WCAG AA.

| Aspek | Target |
| --- | --- |
| Performa | LCP < 2 detik di 4G; hitung ulang < 50 ms per perubahan input |
| Ukuran bundle | JS < 150 KB gzip untuk halaman kalkulator |
| Offline | PWA: kalkulator tetap jalan tanpa internet setelah kunjungan pertama |
| Kompatibilitas | Chrome, Safari, Firefox 2 versi terakhir; layar mulai 360 px |
| Akurasi | Unit test untuk semua rumus, termasuk kasus tepi (rotasi, halaman ganjil, desain > kertas) |
| SEO | Satu URL per modul (/layout-cetak, /kalkulator-buku, dst.), meta + schema FAQ, konten panduan singkat |
| Privasi | Tanpa login di MVP; analitik tanpa data pribadi |
| Aksesibilitas | Label pada semua input, navigasi keyboard pada tab dan chip |

## Teknis, metrik, roadmap, risiko

### Arsitektur yang disarankan

| Lapisan | Pilihan | Alasan |
| --- | --- | --- |
| Frontend | Next.js (static export) atau Astro + React, Tailwind | Cepat, SEO per modul, mudah jadi PWA |
| Mesin hitung | Paket TypeScript murni (`calc-core`) terpisah dari UI | Bisa di-unit-test dan dipakai ulang (admin, penawaran) |
| Preview | SVG yang digenerate dari hasil hitung | Tajam di semua layar, mudah diekspor ke PNG/PDF |
| Backend (MVP) | Supabase / Firebase: tabel preset kertas, ukuran plano, harga | Admin sederhana tanpa server sendiri |
| Ekspor | Render PDF di client (jsPDF / pdf-lib) dengan kop perusahaan | Tanpa biaya server |
| Hosting & analitik | Vercel / Cloudflare Pages di subdomain perusahaan + Plausible/Umami | Murah, analitik tanpa cookie |

### Metrik sukses (3 bulan setelah rilis)

| Metrik | Target |
| --- | --- |
| Staf yang memakai tiap minggu | 100% admin/CS dan operator |
| Penawaran yang dibuat lewat web | ≥ 80% penawaran cetak |
| Klik Order/Chat WhatsApp dari pelanggan | ≥ 5% sesi |
| Selisih order kertas vs kebutuhan nyata | < 3% |
| Laporan salah hitung | < 1 per 500 sesi |

### Roadmap

&#91;embedded content: roadmap · 3 fase, 2 gate\]

Fase 2 baru dimulai setelah rumus MVP cocok dengan hitungan manual operator pada 20 kasus nyata.

### Risiko & mitigasi

| Risiko | Mitigasi |
| --- | --- |
| Rumus berbeda dengan praktik mesin perusahaan (gripper, margin mesin) | Parameter margin/gripper diatur di admin; uji dengan operator sebelum rilis |
| Harga kertas cepat berubah | Harga dikelola admin, tampilkan tanggal update harga |
| Staf tetap memakai Excel lama | Ekspor penawaran PDF lebih cepat dari Excel; latih staf saat rilis |

### Pertanyaan terbuka

- Web ini dibuka untuk pelanggan umum, atau hanya staf internal?
- Ukuran kertas, plano, dan mesin apa saja yang dipakai perusahaan (untuk preset awal)?
- Apakah harga perlu dibedakan untuk pelanggan umum dan pelanggan langganan?
