# LANGKAH 0 — Verifikasi R1/R10 (23 Nov 2026, lane Watch-T3)

## Ringkasan verdict: **CONDITIONAL — BUKAN GO BERSIH**
- **Boleh dikerjakan (build gratis, tanpa KYC):** pendaftaran + build + submit
  TIDAK berbayar dan TIDAK meminta dokumen identitas di tahap mana pun yang
  tertulis di halaman event. Sandbox Terminal 3 gratis (20.000 test credits).
- **Flag payout (alasan CONDITIONAL, bukan GO):** template syarat umum
  DoraHacks menyatakan distribusi hadiah "subject to KYC/AML review and
  sponsor approval where applicable" — hak KYC di payout DICADANGKAN secara
  umum, meski halaman event Terminal 3 sendiri TIDAK menyebut KYC.
  Bila saat menang diminta dokumen identitas → itu keputusan IDR sendiri,
  kru TIDAK PERNAH mengisi/mengirim dokumen identitas (R9).
- **Bukti langsung halaman listing DoraHacks BELUM didapat:** fetch teks
  `https://dorahacks.io/hackathon/` ditolak upstream (HTTP 405, 23 Nov 2026
  09:33 WIB) dan pencarian web tidak mengembalikan URL listing persisnya.
  Sebelum submit, koordinator WAJIB cek listing DoraHacks via browser live
  dan cocokkan syaratnya dengan kutipan di bawah.

## Fakta event (sumber: AINave — mirror listing DoraHacks, dibaca 23 Nov 2026)
- Nama: Terminal 3 Build+Scale Agent Micro Grant; virtual hackathon di
  DoraHacks oleh Terminal 3; online, 11 Nov–24 Des 2026 (44 hari).
- Submit dibuka 10 Nov 2026 06:00 UTC; **deadline 24 Des 2026 15:59 UTC
  (22:59 WIB)**.
- Hadiah: "The top 2 builders with the strongest agentic solutions receive
  access to a cash micro-grant pool of US$1,800." + "All T3 credits consumed
  during the program period are fully covered by Terminal 3." + "Top teams
  after the grant may be referred to Google Cloud to qualify for over
  $100,000 in GCP credits through its startup program." + listing di
  Terminal 3 Agent Directory + undangan event eksklusif.
- Penjurian: **Traction 80%** — "measured by credits consumed across unique
  DIDs, plus a submitted user dashboard, analytics, or other proof";
  **Visibility 20%** — "measured by following Terminal 3 on X,
  participating in the developer Telegram group, and social media
  impressions and engagement. Tag @terminal3io to get amplified."
- Submit wajib: "A GitHub, GitLab, or Bitbucket repository link is required.
  A demo video is required."
- Gabung: "Teams can be formed through the DoraHacks page. Questions and
  extra credits can be requested through the Terminal 3 Developer Telegram
  group (@terminal3developer)."
- Eventbrite (DoraHacks): tiket **Free**.

## Rules & eligibility (kutipan halaman event)
- "Projects may be built with AI assistance, but submitting purely
  AI-generated code without real execution and user adoption is discouraged."
- "Existing builds are allowed, as long as they integrate the Terminal 3
  Developer Platform SDK."
- "The program is aimed at people who want to build real products and
  possibly grow them into companies."
- "Bounty hunters and anyone spamming projects with AI-generated builds are
  not the intended audience."
- **Tidak ada klausul KYC / dokumen identitas / biaya di halaman event.**

## ToS DoraHacks — yang dicek
1. **Terms of Use Agreement (9 Oct 2023, cdn.dorahacks.io):** kata "KYC"
   TIDAK MUNCUL sama sekali (0 hasil find). "Verifikasi" hanya muncul
   sebagai kewajiban umum menyerahkan dokumentasi kepatuhan bila diminta
   ("you will furnish Company any documentation, substantiation or releases
   necessary to verify your compliance with this Agreement"). Bagian
   "Hackathon Prize Safe": fitur OPSIONAL organizer; bila dipakai, fee 5%
   dan "DoraHacks retains the ultimate authority over the fair and
   equitable distribution of the prizes." Tidak ada syarat identitas
   eksplisit untuk payout di dokumen ini.
   CATATAN: ada rujukan pihak ketiga ke ToS DoraHacks yang diperbarui
   20 Sep 2026 — versi itu BELUM diverifikasi langsung; cek ulang sebelum
   submit.
2. **Template Terms & Conditions organizer DoraHacks
   (dashboard.dorahacks.io):** "Prize distribution is subject to KYC/AML
   review and sponsor approval where applicable." ← ini sumber flag
   CONDITIONAL. "Where applicable" = tidak otomatis berlaku untuk semua
   event, tapi haknya dicadangkan.
3. **Pembanding — event DoraHacks lain (Gensyn Agent Arena):** "Prizes are
   paid in USDC after the integrity review, sanctions screening, and KYC."
   → KYC-di-payout adalah keputusan PER EVENT / sponsor, bukan aturan
   platform yang seragam. Event Terminal 3 TIDAK menulis klausul itu.

## R10 — 6 cek verifikasi platform
1. Operator legal: DoraHacks = Hackerlink Limited (British Virgin Islands,
   menurut ToS § pembuka); Terminal 3 = Terminal 3 (terminal3.io).
   Alamat fisik/registrasi lengkap BELUM dicek di registry resmi — cek
   sebelum submit bila menang.
2. Lisensi regulator: tidak relevan — hackathon/grant, bukan produk keuangan.
3. Umur domain: dorahacks.io + terminal3.io + docs.terminal3.io hidup dan
   terindeks (konten segar, crawl <1 hari); cek ICANN formal belum dilakukan.
4. Pasal ToS payout/KYC: lihat di atas (ToS 2023 tanpa KYC; template
   organizer mencadangkan KYC/AML "where applicable").
5. Bukti payout independen: BELUM ADA — event baru (Nov 2026), belum ada
   pemenang/payout yang bisa dicek. Hadiah $1.800 kecil; risiko utama =
   waktu build, bukan uang.
6. Peringatan regulator / "nama + scam": tidak ada sinyal negatif dari
   pencarian 23 Nov 2026 (DoraHacks platform hackathon mapan).

## Keputusan lane
- **LANJUT build fondasi (gratis, tanpa KYC, tanpa daftar berbayar).**
  Target lane: verifikasi + fondasi + rencana bertahap — BUKAN submit hari ini.
- **STOP-conditions sebelum submit:** (a) listing DoraHacks live ternyata
  memuat syarat KYC/biaya → STOP + lapor IDR; (b) klaim API key Terminal 3
  ternyata meminta pembayaran/KYC → STOP; (c) bila menang dan payout
  meminta dokumen identitas → serahkan ke IDR, kru tidak isi dokumen.

## STATUS — RESUME 23 Nov 2026 09:47 WIB (perintah IDR: jeda DICABUT)
- **Eksekusi LANJUT untuk keenam target, termasuk Terminal 3.** Pertanyaan
  verdict R9 yang menggantung TIDAK LAGI jadi blocker: perintah IDR
  23 Nov 09:47 WIB ini yang berlaku. Status klausul dicatat saja:
  template T&C organizer DoraHacks tetap mencadangkan KYC/AML di payout
  "where applicable"; halaman event Terminal 3 sendiri tetap TIDAK
  menyebut KYC. Bila menang dan payout menuntut dokumen identitas,
  keputusan milik IDR; lane TIDAK PERNAH mengisi/mengirim dokumen
  identitas atau form pajak.
- **Cek ulang R9 literal (koreksi Soekarno) BELUM FINAL — temuan sementara:**
  - Listing DoraHacks live `dorahacks.io/hackathon/t3-build-scale-grant/detail`
    (fetch teks 23 Nov, 59 baris): kata "KYC" = 0 hit, "Terms" = 0 hit —
    TAPI fetch teks mungkin tidak mencakup isi tab T&C (halaman berakhir di
    "Events"); belum bisa menyatakan "tidak ada cadangan hak".
  - Template T&C organizer DoraHacks (dashboard.dorahacks.io): "Prize
    distribution is subject to KYC/AML review and sponsor approval where
    applicable." — hak KYC di payout DICADANGKAN di level platform.
  - Pola terkonfirmasi di event DoraHacks lain — Delphi Agent Arena
    (AINave, dibaca 23 Nov): "Prizes are paid in USDC after the integrity
    review, sanctions screening, and KYC."
  - ToS DoraHacks 2023 (PDF): kata "KYC" = 0 hit.
  - **Putusan SKIP vs LANJUT masih menggantung** — diputuskan koordinator
    saat resume (R9 literal: ada cadangan hak → SKIP; ketiadaan yang
    terverifikasi → lanjut).
- Fondasi repo tetap tersimpan apa adanya (lihat README/PLAN); tidak ada
  yang dihapus, tidak ada submit setengah jalan.
