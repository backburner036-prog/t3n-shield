# Dashboard Traction — T3N Shield (status 23 Nov 2026, r2)

Bukti adopsi untuk juri (Traction 80% = credits di DID unik + dashboard/analitik).

## Angka saat ini — JUJUR

| Metrik | Nilai | Keterangan |
|---|---|---|
| DID unik (pengguna nyata) | **0** | Belum ada pengguna; demo baru lokal |
| Credits testnet terpakai | **0** | Belum ada API key — klaim key butuh sign-in claim page (langkah IDR/browser) |
| Aksi tercatat (audit.jsonl) | 4 | Demo lokal simulasi 23 Nov 2026 (2 allowed, 2 denied) |
| Rantai audit | VALID | 4/4 receipt terverifikasi |
| Kontrak TEE ter-deploy di testnet | Belum | WASM ter-build lokal, belum register (butuh key) |
| Pengguna uji nyata | 0 | P3 — setelah demo live jalan |

## Yang sudah terbukti (bukan klaim kosong)

- Kontrak `pii-shield` v0.1.0: 14/14 test Rust lolos; WASM component
  250.334 byte, SHA-256 `bb677830b1dabf2a19c28cb505d4157ea9faac02ab664223a115a93bea7aa249`.
- Gateway: grant sempit ditegakkan (store tanpa grant DITOLAK, host tak
  diizinkan DITOLAK); jawaban kontrak hanya yes/no + teks teredaksi.
- Demo lokal `npm run demo` jalan end-to-end; `tsc` bersih.
- Dashboard live: `npx tsx src/dashboard.ts` → http://localhost:4173

## Rencana traction (P3, 6–18 Des 2026)

1. Klaim API key + test credits (langkah IDR — sign-in claim page).
2. `npm run deploy:register` + `npm run demo:live` → credits pertama terpakai.
3. Ajak pengguna uji nyata (grup Telegram @terminal3developer, X @terminal3io).
4. Rekam video demo + submit sebelum 24 Des 2026 22:59 WIB.

**Tanpa pengguna nyata, skor Traction mentok** — ini risiko utama yang
dicatat di PLAN.md, bukan disembunyikan.
