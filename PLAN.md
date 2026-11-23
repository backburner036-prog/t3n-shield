# PLAN — Build bertahap T3N Shield (deadline 24 Des 2026, 22:59 WIB)

Deadline paling longgar dari 6 target → kerjakan verifikasi + fondasi dulu,
build bertahap, submit di akhir. Satu-satunya risiko skor: Traction 80%
butuh ADOPSI NYATA (credits di banyak DID unik), bukan sekadar demo.

## P0 — SELESAI 23 Nov 2026 (lane ini)
- [x] Verifikasi R1/R10 + verdict CONDITIONAL (lihat VERIFIKASI.md)
- [x] Ringkasan skill Terminal 3 ADK (lihat README.md)
- [x] Scaffold repo + quickstart skeleton + rencana ini

## P1 — Fondasi teknis (target: 25–27 Nov 2026)
- [x] Instal Rust + WASM toolchain (`rustup` 1.100.0, target wasm32-wasip2
      + wasm32-unknown-unknown) — SELESAI 23 Nov 2026 r2.
- [x] `npm install` + `tsc` bersih; `src/quickstart.ts` DIPERBAIKI ke pola
      SDK 5.41.0 (skeleton P0 pakai field `apiKey` yang tidak ada di 5.41.0).
- [ ] Jalankan `src/quickstart.ts` live (handshake + authenticate +
      TenantClient ready) dengan API key dari claim page (self-serve, gratis).
      **BLOKIR r2: `T3N_API_KEY` belum ada di VM; klaim butuh sign-in email
      di https://www.terminal3.io/claim-page — langkah IDR/browser.**
- [ ] Klaim test credits sandbox (20.000 credits, testnet) — ikut blokir di atas.
- [x] Buat repo GitHub `backburner036-prog/t3n-shield` + push fondasi ini.
      SELESAI 23 Nov 2026 r2: https://github.com/backburner036-prog/t3n-shield
      (commit 2eda7e2).
- [x] Tulis kontrak TEE pertama (Rust→WASM): `contracts/pii-shield`
      (vault store/check/forget + fungsi baru `redact`); 14/14 test lolos;
      WASM 250.334 byte, SHA-256 tercatat di `traction/dashboard.md`.

## P2 — Inti produk (target: 28 Nov–5 Des 2026) — SEBAGIAN SELESAI r2 (23 Nov)
- [x] Gateway agen (`src/gateway.ts`): tiap aksi agen dicek grant delegasi
      dulu (fungsi + kontrak + host tujuan); tanpa grant → ditolak + dicatat.
- [x] Audit trail (`src/audit.ts`): tiap aksi = 1 receipt hash-chained
      (DID, fungsi, host, waktu, hash) yang bisa diverifikasi.
- [x] Demo flow end-to-end (SIMULASI, `npm run demo`): pengguna beri grant
      sempit → agen check/redact → PII tidak pernah terlihat server/agen;
      store tanpa grant + host tak diizinkan DITOLAK.
- [ ] Demo flow LIVE di testnet (`src/demo-live.ts`) — butuh API key (blokir P1).
- [ ] Dashboard traction minimal (`src/dashboard.ts` + `traction/dashboard.md`) — SELESAI r2.

## P3 — Traction + visibilitas (target: 6–18 Des 2026)
- [ ] Demo app minimal (web) + dashboard traction (credits per DID unik).
- [ ] Ajak pengguna uji nyata (grup Telegram @terminal3developer, X
      @terminal3io) — adopsi = 80% skor, jadi ini fase terpenting.
- [ ] Rekam video demo (wajib submit).
- [ ] Postingan X berkala menandai @terminal3io (20% visibility).

## P4 — Submit (target: 19–24 Des 2026, SEBELUM 22:59 WIB)
- [ ] Cek ulang listing DoraHacks via browser live (syarat + KYC + payout).
- [ ] `makefun`-style QC sendiri: repo publik + README + video + dashboard.
- [ ] Submit via web DoraHacks (repo link + video) — langkah submit persis
      diserahkan ke koordinator (lane ini tidak punya browser live).
- [ ] Bila menang dan payout minta dokumen identitas → STOP, serahkan ke IDR.

## Risiko
1. Traction 80% = adopsi nyata — tanpa pengguna, skor mentok walau kode bagus.
   Mitigasi: bangun untuk kebutuhan nyata + promosi sejak P3, bukan H-3.
2. KYC-di-payout dicadangkan template DoraHacks ("where applicable") —
   hadiah bisa tersangkut verifikasi identitas. Mitigasi: putusan IDR saat itu.
3. SDK berubah cepat (5.40.0 → 5.41.0 dalam seminggu; breaking change di
   minor version) — selalu install latest, ikuti Changelog docs.
4. Delegated agents / OAuth / bearer-token `invoke` TIDAK tersedia di testnet
   (changelog 18 Nov 2026) — agen di testnet pakai API key agen milik organisasi.
