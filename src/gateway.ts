// T3N Shield — P2 gateway agen terdelegasi.
//
// Aturan: agen TIDAK PERNAH memanggil kontrak TEE langsung. Setiap aksi
// melewati gateway ini, yang memeriksa grant delegasi dulu:
//   - grant ada untuk (grantee DID, contract_id, function)?
//   - host tujuan (bila ada) ada di allowed_hosts grant?
// Tanpa grant -> ditolak + dicatat di audit trail. Dengan grant -> eksekusi
// diteruskan ke kontrak TEE, dan hasilnya dicatat sebagai receipt.
//
// Gateway ini transport-agnostic: Executor disuntik dari luar (live
// TenantClient di src/live.ts, atau executor simulasi di demo-local.ts).
// PII tidak pernah lewat gateway: kontrak hanya mengembalikan jawaban
// yes/no atau teks yang sudah diredaksi — gateway tidak pernah melihat
// nilai mentah.

import { createHash } from "node:crypto";
import { appendReceipt, type AuditReceipt } from "./audit.js";

export interface Grant {
  /** DID agen (grantee), mis. did:t3n:... */
  grantee: string;
  /** ID kontrak numerik dari register, atau "*" (hanya di tepi agen). */
  contractId: number | "*";
  /** Satu fungsi per grant, mis. "check" / "redact". */
  functionName: string;
  /** Host tujuan yang diizinkan (kosong = tidak ada egress). */
  allowedHosts: string[];
  /** Epoch detik; grant kedaluwarsa ditolak. */
  validUntilSecs: number;
}

export interface AgentAction {
  /** DID agen yang meminta. */
  agentDid: string;
  /** ID kontrak tujuan. */
  contractId: number;
  /** Fungsi kontrak yang diminta. */
  functionName: string;
  /** Host tujuan bila aksi ini egress (opsional). */
  host?: string;
  /** Input JSON untuk kontrak (tidak boleh berisi PII mentah). */
  input: unknown;
}

export interface Executor {
  execute(contractId: number, functionName: string, input: unknown): Promise<unknown>;
}

export class GrantDenied extends Error {
  constructor(public readonly reason: string) {
    super(`grant denied: ${reason}`);
    this.name = "GrantDenied";
  }
}

/** Cek satu grant terhadap satu aksi. Mengembalikan alasan penolakan atau null bila lolos. */
export function checkGrant(grants: Grant[], action: AgentAction, nowSecs: number): string | null {
  const grant = grants.find(
    (g) =>
      g.grantee === action.agentDid &&
      (g.contractId === "*" || g.contractId === action.contractId) &&
      g.functionName === action.functionName,
  );
  if (!grant) return `no grant for ${action.agentDid} on contract ${action.contractId}/${action.functionName}`;
  if (grant.validUntilSecs <= nowSecs) return `grant expired at ${grant.validUntilSecs}`;
  if (action.host && !grant.allowedHosts.includes(action.host)) {
    return `host ${action.host} not in allowed_hosts [${grant.allowedHosts.join(", ")}]`;
  }
  if (!action.host && grant.allowedHosts.length > 0 && action.functionName !== "check" && action.functionName !== "redact") {
    return `function ${action.functionName} requires an allowed host`;
  }
  return null;
}

function receiptHash(r: Omit<AuditReceipt, "hash">): string {
  const canonical = JSON.stringify([
    r.ts, r.agentDid, r.contractId, r.functionName, r.host ?? "", r.decision, r.reason ?? "", r.prevHash,
  ]);
  return createHash("sha256").update(canonical).digest("hex");
}

/**
 * Jalankan satu aksi agen lewat gateway: cek grant -> eksekusi -> receipt.
 * Receipt ditulis SELALU (lolos maupun ditolak) — penolakan juga jejak audit.
 */
export async function runAgentAction(
  grants: Grant[],
  executor: Executor,
  action: AgentAction,
  prevHash: string,
): Promise<{ result: unknown; receipt: AuditReceipt }> {
  const nowSecs = Math.floor(Date.now() / 1000);
  const denied = checkGrant(grants, action, nowSecs);
  const base = {
    ts: new Date().toISOString(),
    agentDid: action.agentDid,
    contractId: action.contractId,
    functionName: action.functionName,
    host: action.host ?? null,
    prevHash,
  };
  if (denied) {
    const receipt: AuditReceipt = { ...base, decision: "denied", reason: denied, hash: "" };
    receipt.hash = receiptHash(receipt);
    appendReceipt(receipt);
    throw new GrantDenied(denied);
  }
  const result = await executor.execute(action.contractId, action.functionName, action.input);
  const receipt: AuditReceipt = { ...base, decision: "allowed", reason: null, hash: "" };
  receipt.hash = receiptHash(receipt);
  appendReceipt(receipt);
  return { result, receipt };
}
