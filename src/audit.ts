// T3N Shield — P2 audit trail.
//
// Tiap aksi agen = 1 receipt (JSONL, hash-chained: tiap receipt mengikat
// hash receipt sebelumnya). Receipt TIDAK PERNAH berisi PII atau nilai
// mentah — hanya DID, kontrak, fungsi, host, waktu, keputusan, dan hash.
// Verifikasi: jalankan ulang rantai hash dari receipt pertama; satu
// perubahan di tengah rantai merusak semua hash sesudahnya.

import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export interface AuditReceipt {
  ts: string; // ISO
  agentDid: string;
  contractId: number;
  functionName: string;
  host: string | null;
  decision: "allowed" | "denied";
  reason: string | null;
  prevHash: string; // "GENESIS" untuk receipt pertama
  hash: string; // sha256 atas field di atas (tanpa hash)
}

export const AUDIT_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "traction");
export const AUDIT_FILE = join(AUDIT_DIR, "audit.jsonl");

export function appendReceipt(r: AuditReceipt): void {
  mkdirSync(AUDIT_DIR, { recursive: true });
  appendFileSync(AUDIT_FILE, JSON.stringify(r) + "\n");
}

export function readReceipts(): AuditReceipt[] {
  if (!existsSync(AUDIT_FILE)) return [];
  return readFileSync(AUDIT_FILE, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as AuditReceipt);
}

export function lastHash(): string {
  const rows = readReceipts();
  return rows.length ? rows[rows.length - 1].hash : "GENESIS";
}

/** Verifikasi rantai: kembalikan { ok, checked, firstBadIndex }. */
export function verifyChain(): { ok: boolean; checked: number; firstBadIndex: number } {
  const rows = readReceipts();
  let prev = "GENESIS";
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (r.prevHash !== prev) return { ok: false, checked: i, firstBadIndex: i };
    const canonical = JSON.stringify([
      r.ts, r.agentDid, r.contractId, r.functionName, r.host ?? "", r.decision, r.reason ?? "", r.prevHash,
    ]);
    const expect = createHash("sha256").update(canonical).digest("hex");
    if (r.hash !== expect) return { ok: false, checked: i, firstBadIndex: i };
    prev = r.hash;
  }
  return { ok: true, checked: rows.length, firstBadIndex: -1 };
}
