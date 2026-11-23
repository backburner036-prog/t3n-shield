// T3N Shield — demo lokal (SIMULASI, tanpa testnet).
//
// Menjalankan alur end-to-end gateway di memori dengan executor simulasi
// yang meniru jawaban kontrak TEE (yes/no + teks teredaksi). Tujuannya:
// membuktikan logika gateway + audit trail jalan SEBELUM API key tersedia.
// BUKAN bukti testnet — demo live (src/demo-live.ts) memakai TenantClient
// asli dan hanya jalan dengan T3N_API_KEY.
//
// Alur demo:
//   1. Pengguna memberi grant sempit ke agen: hanya `check` + `redact`
//      pada kontrak shield, tanpa host egress.
//   2. Agen bertanya "apakah pengguna di atas 18?" -> dijawab true/false.
//   3. Agen minta redaksi teks berisi PII -> kembali teks placeholder.
//   4. Agen mencoba fungsi terlarang (`store`) + host tak diizinkan
//      -> DITOLAK + tercatat di audit trail.
//   5. Rantai audit diverifikasi.

import { runAgentAction, type Executor, type Grant } from "./gateway.js";
import { lastHash, readReceipts, verifyChain, AUDIT_FILE } from "./audit.js";

// Executor simulasi: meniru kontrak TEE (jawaban saja, tanpa nilai).
const simulatedExecutor: Executor = {
  async execute(_contractId: number, functionName: string, input: unknown) {
    if (functionName === "check") {
      const rules = (input as { rules: Record<string, unknown> }).rules;
      const answers: Record<string, boolean> = {};
      for (const k of Object.keys(rules)) answers[k] = k === "min_age" ? true : k === "kyc_verified" ? true : false;
      return { answers, custom: { vault_op: "check", rules_asked: String(Object.keys(rules).length) } };
    }
    if (functionName === "redact") {
      const text = (input as { text: string }).text;
      return {
        redacted: text
          .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[EMAIL]")
          .replace(/\+?\d[\d\s-]{7,}\d/g, "[PHONE]"),
        custom: { vault_op: "redact" },
      };
    }
    throw new Error(`simulated contract: unknown function ${functionName}`);
  },
};

const AGENT_DID = "did:t3n:demo-agent-00000000000000000000000000000001";
const CONTRACT_ID = 1; // placeholder lokal; live: contract_id dari DEPLOY.md
const now = Math.floor(Date.now() / 1000);

const grants: Grant[] = [
  {
    grantee: AGENT_DID,
    contractId: CONTRACT_ID,
    functionName: "check",
    allowedHosts: [],
    validUntilSecs: now + 3600,
  },
  {
    grantee: AGENT_DID,
    contractId: CONTRACT_ID,
    functionName: "redact",
    allowedHosts: [],
    validUntilSecs: now + 3600,
  },
];

console.log("== T3N Shield demo lokal (SIMULASI — bukan testnet) ==");
console.log(`Audit file: ${AUDIT_FILE}\n`);

const r1 = await runAgentAction(grants, simulatedExecutor, {
  agentDid: AGENT_DID, contractId: CONTRACT_ID, functionName: "check",
  input: { rules: { min_age: 18, kyc_verified: true } },
}, lastHash());
console.log("1. check min_age=18, kyc_verified ->", JSON.stringify(r1.result));

const r2 = await runAgentAction(grants, simulatedExecutor, {
  agentDid: AGENT_DID, contractId: CONTRACT_ID, functionName: "redact",
  input: { text: "Hubungi saya di ana@example.com atau +62 812-3456-7890." },
}, lastHash());
console.log("2. redact ->", JSON.stringify(r2.result));

for (const bad of [
  { functionName: "store", input: { name: "Ana" }, label: "3. store (tanpa grant)" },
  { functionName: "check", host: "https://evil.example", input: { rules: { min_age: 18 } }, label: "4. check + host tak diizinkan" },
]) {
  try {
    await runAgentAction(grants, simulatedExecutor, {
      agentDid: AGENT_DID, contractId: CONTRACT_ID, ...bad,
    }, lastHash());
    console.log(`${bad.label} -> LULUS (SALAH — seharusnya ditolak!)`);
  } catch (e) {
    console.log(`${bad.label} -> DITOLAK: ${(e as Error).message}`);
  }
}

const chain = verifyChain();
console.log(`\nAudit: ${readReceipts().length} receipt, rantai hash ${chain.ok ? "VALID" : "RUSAK"} (${chain.checked} diperiksa).`);
console.log("Demo lokal SELESAI.");
