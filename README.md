# QR Code Studio

Generator QR modern (React + Vite + Tailwind). Fitur: live preview, error correction, size, margin, warna & background transparan, download PNG/SVG, copy PNG, peringatan kontras, simpan setting, favicon.

## Jalankan Lokal
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```
Output di folder `dist/`.

## Deploy ke Vercel
1. Push repo ini ke GitHub (public/private bebas).
2. Buka https://vercel.com → **Add New Project** → Import repo.
3. Framework: Vite (auto), Build Command: `npm run build`, Output: `dist`.
4. Deploy.




## ✨ Fitur

Berikut bagian **Fitur** yang bisa langsung ditempel ke README kamu.

### Ringkasan

* ✅ **Live Preview** (canvas) + output **SVG**
* ✅ **Error Correction**: L / M / Q / H
* ✅ **Ukuran** 128–1024 px & **Quiet Zone (margin)** 0–8
* ✅ **Warna** foreground/background + **background transparan**
* ✅ **Download** **PNG/SVG** & **Copy PNG** ke clipboard (ada fallback)
* ✅ **Peringatan kontras** (membantu keterbacaan scanner)
* ✅ **Simpan pengaturan** (localStorage)
* ✅ **Favicon** kustom & **footer** hak cipta
* ✅ **UI responsif** + aksesibel (keyboard‑friendly)
* ✅ 100% **client‑side** (tidak ada backend)

### Detail Fitur

* **Live Preview & SVG**
  QR dirender ke **canvas** untuk pratinjau instan dan juga diekspor sebagai **SVG** berkualitas tinggi.

* **Error Correction (L/M/Q/H)**
  Pilih ketahanan QR terhadap kerusakan/blur (semakin tinggi semakin rapat modul).

* **Kontrol Ukuran & Quiet Zone**
  Slider ukuran hingga 1024 px dan margin/quiet‑zone 0–8 untuk reliabilitas pemindaian.

* **Kustomisasi Warna & Transparansi**
  Ubah warna foreground/background. **Background transparan** memakai `#ffffff00`.

* **Ekspor & Clipboard**
  **Download PNG** via `canvas.toBlob()` dan **SVG** via `QRCode.toString(type:"svg")`.
  **Copy PNG** mendukung **ClipboardItem**, dengan **fallback** ke data URL bila API tidak tersedia.

* **Peringatan Kontras**
  Menghitung rasio kontras (WCAG‑like) untuk memberi saran saat kombinasi warna berpotensi sulit dipindai.

* **Persistensi Pengaturan**
  Menyimpan nilai form ke **localStorage** dan memulihkannya saat reload.

* **Branding & Aksesibilitas**
  **Favicon** kustom, footer © R Zanuar Eko Prastio. Komponen memiliki label, `aria-pressed`, dan state visual jelas.

* **Tanpa Backend**
  Seluruh proses terjadi di browser (privasi terjaga, cocok untuk static hosting **Vercel**).

### Rangkuman Fitur (Tabel)

| Fitur                 | Keterangan                             | Lokasi Kode                                        |
| --------------------- | -------------------------------------- | -------------------------------------------------- |
| Live Preview (Canvas) | Render QR ke canvas saat input berubah | `src/App.jsx` → `QRCode.toCanvas(...)`             |
| Ekspor SVG            | Hasil SVG vektor tajam                 | `src/App.jsx` → `QRCode.toString(..., type:"svg")` |
| Error Correction      | L / M / Q / H                          | State `level`, tombol `levelBtn`                   |
| Ukuran & Margin       | Slider size (128–1024), margin (0–8)   | State `size`, `margin` + input range               |
| Warna & Transparansi  | Foreground/Background + transparan     | State `darkColor`, `lightColor`, `transparentBg`   |
| Download PNG/SVG      | Simpan file lokal                      | `downloadPNG()`, `downloadSVG()`                   |
| Copy PNG              | Salin ke clipboard (dengan fallback)   | `copyPNG()`                                        |
| Peringatan Kontras    | Rasio kontras auto                     | `contrastRatio` (useMemo)                          |
| Persistensi           | Simpan & restore setting               | `localStorage` (useEffect)                         |
| Favicon & Footer      | Branding siap produksi                 | `index.html` + footer README                       |

> **Catatan**: Untuk QR cetak/ukuran kecil, gunakan **size** dan **margin** lebih besar, serta kontras tinggi.


## Lisensi
© 2025 R Zanuar Eko Prastio. All rights reserved.
