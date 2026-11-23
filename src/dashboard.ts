// T3N Shield — dashboard traction minimal (P3).
// Server HTTP statis tanpa dependensi: menampilkan jumlah receipt audit,
// rantai hash (VALID/RUSAK), dan tabel receipt terakhir. Data dari
// traction/audit.jsonl — bukti adopsi untuk juri (credits per DID unik
// baru terisi setelah demo live + pengguna nyata; saat ini masih 0).
// Jalankan: npx tsx src/dashboard.ts [port, default 4173]

import { createServer } from "node:http";
import { readReceipts, verifyChain } from "./audit.js";

const PORT = Number(process.argv[2] ?? 4173);

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const server = createServer((_req, res) => {
  const receipts = readReceipts().slice(-50).reverse();
  const chain = verifyChain();
  const dids = new Set(readReceipts().map((r) => r.agentDid));
  const allowed = readReceipts().filter((r) => r.decision === "allowed").length;
  const denied = readReceipts().filter((r) => r.decision === "denied").length;
  const rows = receipts
    .map(
      (r) =>
        `<tr><td>${esc(r.ts)}</td><td>${esc(r.agentDid.slice(0, 18))}…</td><td>${r.contractId}/${esc(r.functionName)}</td><td>${esc(r.host ?? "—")}</td><td>${r.decision}</td><td>${esc((r.reason ?? "").slice(0, 60))}</td><td><code>${r.hash.slice(0, 12)}…</code></td></tr>`,
    )
    .join("\n");
  const html = `<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><title>T3N Shield — Traction</title>
<style>body{font-family:system-ui,sans-serif;max-width:960px;margin:2rem auto;padding:0 1rem}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:4px 8px;text-align:left;font-size:13px}.stat{font-size:2rem;font-weight:700}.ok{color:green}.bad{color:red}</style></head><body>
<h1>T3N Shield — Dashboard Traction</h1>
<p>Terminal 3 Build+Scale Agent Micro Grant — bukti adopsi untuk juri (Traction 80%).</p>
<p><span class="stat">${readReceipts().length}</span> aksi tercatat &nbsp;·&nbsp; <span class="stat">${dids.size}</span> DID unik &nbsp;·&nbsp; ${allowed} diizinkan / ${denied} ditolak</p>
<p>Rantai audit: <strong class="${chain.ok ? "ok" : "bad"}">${chain.ok ? "VALID" : "RUSAK"} (${chain.checked} receipt diperiksa)</strong></p>
<p><em>Catatan jujur: angka di atas baru dari demo lokal (simulasi). Credits testnet per DID unik = 0 — traction nyata butuh pengguna + demo live (lihat PLAN.md P3).</em></p>
<table><tr><th>Waktu</th><th>Agen (DID)</th><th>Kontrak/Fungsi</th><th>Host</th><th>Keputusan</th><th>Alasan</th><th>Hash</th></tr>${rows}</table>
</body></html>`;
  res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  res.end(html);
});

server.listen(PORT, () => console.log(`T3N Shield dashboard: http://localhost:${PORT}`));
