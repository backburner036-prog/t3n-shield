# T3N Shield — PII-Redacting Delegated Agent Gateway

**Terminal 3 Build+Scale Agent Micro Grant (DoraHacks) — lane build Watch-T3**
**Deadline submit: Kam 24 Des 2026, 15:59 UTC (22:59 WIB) | Status lane: VERIFIKASI + FONDASI (bukan submit hari ini)**

## Konsep (1 kalimat)
Agen AI yang hanya boleh bertindak atas izin delegasi yang sempit (scoped grant),
dan semua PII pengguna mengalir lewat kontrak TEE Terminal 3 — agen + server
kita TIDAK PERNAH melihat plaintext PII — dengan jejak audit yang bisa
diverifikasi untuk setiap aksi agen.

## Kenapa ini pas dengan kriteria juri
- **Traction 80%** — diukur dari credits yang dipakai di banyak DID unik +
  dashboard/analitik pengguna. Desain kami memang multi-user sejak awal:
  tiap pengguna = 1 DID tenant, tiap aksi = 1 panggilan kontrak TEE yang
  termeter. Dashboard `traction/` menampilkan pemakaian per DID (bukti juri).
- **Visibility 20%** — demo video + postingan X menandai @terminal3io,
  gabung grup Telegram developer @terminal3developer.
- **Tema grant** — governance (delegasi sempit + audit trail), trust
  (verifikasi trust anchor TDX/SEV-SNP), security (TEE contract Rust→WASM),
  privacy (placeholder `{{profile.field}}`, PII tidak pernah lewat kode kita).

## Arsitektur (5 ide ADK, sesuai docs.terminal3.io)
1. **Tenant** — tiap pengguna sign-in → `did:t3n:...` (opaque, dibaca dari sesi,
   jangan pernah dikonstruksi sendiri).
2. **Tenant KV map** — API key / config / state aplikasi, namespaced per tenant;
   akses kontrak bersifat opt-in eksplisit.
3. **TEE contract** — program Rust → WASM yang jalan di enclave; memproses PII
   dan memanggil API pihak ketiga atas nama pengguna tanpa kita melihat plaintext.
4. **Delegated permission** — agen TIDAK punya akses standing; pengguna memberi
   grant per-fungsi per-kontrak, opsional dibatasi host tujuan. Tanpa grant,
   panggilan keluar ditolak.
5. **PII via enclave** — kontrak kirim `{{profile.field}}` placeholder; host
   mengganti nilai asli di dalam enclave pada saat terakhir.

## Struktur repo
```
.
├── README.md            # ini
├── VERIFIKASI.md        # Langkah 0 — R1/R10: kutipan syarat, KYC, payout
├── PLAN.md              # rencana build bertahap sampai 24 Des 2026
├── DEPLOY.md            # (dibuat saat deploy) tenantDid + contract_id
├── package.json         # @terminal3/t3n-sdk (latest, jangan pin versi lama)
├── src/
│   ├── quickstart.ts    # Langkah 0 kode: auth + handshake + TenantClient
│   ├── deploy.ts        # P1: register kontrak + buat map (butuh --register)
│   ├── gateway.ts       # (P2) gateway agen: cek grant sebelum eksekusi
│   ├── audit.ts         # (P2) jejak audit hash-chained tiap aksi agen
│   ├── demo-local.ts    # Demo simulasi (tanpa testnet): `npm run demo`
│   ├── demo-live.ts     # Demo testnet asli (butuh API key): `npm run demo:live`
│   └── dashboard.ts     # Dashboard traction: `npx tsx src/dashboard.ts`
├── contracts/
│   └── pii-shield/      # (P1) kontrak TEE Rust→WASM: vault + redaksi PII
├── traction/
│   ├── dashboard.md     # (P3) bukti adopsi: credits per DID unik
│   └── audit.jsonl      # receipt audit (hash-chained, tanpa PII)
└── .gitignore           # TIDAK PERNAH commit .env / API key / private key
```

## Cara jalan (gratis, tanpa KYC)
1. Klaim API key + test credits di claim page Terminal 3 (self-serve,
   tanpa approval/waitlist; sandbox testnet gratis 20.000 credits).
   Key tampil SEKALI — simpan di env, jangan tulis ke file/repo.
2. `npm install` (SDK `@terminal3/t3n-sdk`, selalu latest — saat scaffold: 5.41.0)
3. `export T3N_API_KEY=...` (dari env, bukan file)
4. `npx tsx src/quickstart.ts` — handshake + authenticate + TenantClient ready.
5. Kontrak TEE butuh Rust + WASM toolchain (`rustup`, `cargo`, target
   `wasm32-unknown-unknown`) — belum terpasang di VM ini; instal di P1.

## Status build
- [x] P0 — Verifikasi R1/R10 + fondasi repo (23 Nov 2026)
- [x] P1 — Rust 1.100 + target wasm32-wasip2 terpasang; kontrak TEE `pii-shield` v0.1.0 ter-build (14/14 test, WASM 250 KB); quickstart diperbaiki ke SDK 5.41.0; repo GitHub dibuat (23 Nov 2026, r2)
- [ ] P1 (sisa, BUTUH API KEY) — jalankan `quickstart.ts` live + klaim test credits + `deploy.ts --register` + `demo-live.ts`. **Blocker: `T3N_API_KEY` belum ada — klaim gratis di claim page butuh sign-in email (langkah IDR/browser, lane ini tak punya browser live).**
- [x] P2 — Gateway grant + audit trail hash-chained + demo lokal jalan (`npm run demo`)
- [ ] P3 — Demo app + dashboard traction + video demo + pengguna nyata (traction 80% — saat ini 0 DID unik, lihat `traction/dashboard.md`)
- [ ] P4 — Submit DoraHacks (repo link + video) — via web, serahkan ke koordinator

## Aturan
- Gratis + tanpa KYC saja. Jangan daftar akun berbayar, jangan isi dokumen identitas.
- Secret tidak pernah ditempel ke chat/laporan/log/repo.
- Repo target: GitHub `backburner036-prog` (dibuat saat P1, oleh koordinator/IDR).
