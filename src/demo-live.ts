// T3N Shield — demo LIVE di testnet (butuh T3N_API_KEY + kontrak ter-deploy).
//
// Alur (data contoh fiktif dari contracts/pii-shield/examples/customer.json):
//   1. Auth + TenantClient, baca contract_id dari DEPLOY.md.
//   2. store record contoh ke kontrak shield (map z:<tid>:shield).
//   3. check min_age/kyc_verified sebagai pemilik -> jawaban yes/no.
//   4. redact teks berisi PII -> teks placeholder.
//   5. Semua aksi lewat gateway (grant lokal) + receipt ke traction/audit.jsonl.
//   6. Verifikasi rantai audit.
//
// JANGAN jalankan dengan data pengguna asli — hanya contoh fiktif.

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  T3nClient,
  TenantClient,
  setEnvironment,
  loadWasmComponent,
  resolveTrustAnchor,
  eth_get_address,
  metamask_sign,
  createEthAuthInput,
  getNodeUrl,
} from "@terminal3/t3n-sdk";
import { runAgentAction, type Executor, type Grant } from "./gateway.js";
import { lastHash, readReceipts, verifyChain } from "./audit.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const T3N_API_KEY = process.env.T3N_API_KEY;
if (!T3N_API_KEY) throw new Error("T3N_API_KEY belum di-set.");

const deployMd = readFileSync(join(ROOT, "DEPLOY.md"), "utf8");
const contractId = Number(/contract_id `(\d+)`/.exec(deployMd)?.[1]);
const version = /version `([^`]+)`/.exec(deployMd)?.[1] ?? "0.1.0";
if (!contractId) throw new Error("DEPLOY.md tidak memuat contract_id — jalankan src/deploy.ts --register dulu.");

setEnvironment("testnet");
const wasmComponent = await loadWasmComponent();
const trustAnchor = await resolveTrustAnchor("testnet");
const address = eth_get_address(T3N_API_KEY);
const t3n = new T3nClient({
  trustAnchor,
  wasmComponent,
  handlers: { EthSign: metamask_sign(address, undefined, T3N_API_KEY) },
});
await t3n.handshake();
const did = await t3n.authenticate(createEthAuthInput(address));
const tenantDid = did.value;
console.log("Authenticated. tenantDid =", tenantDid);

const tenant = new TenantClient({ t3n, baseUrl: getNodeUrl(), tenantDid });
await tenant.tenant.me();
console.log("TenantClient ready. contract_id =", contractId);

const executor: Executor = {
  async execute(cid: number, functionName: string, input: unknown) {
    const out = await tenant.contracts.execute("shield", {
      version,
      functionName,
      input,
    } as never);
    return out;
  },
};

// Di live, agen = DID kita sendiri (self-grant demo). Grant multi-user
// datang dari updateMemberDelegation oleh pemilik data (lihat README).
const grants: Grant[] = (["store", "check", "redact", "forget"] as const).map((fn) => ({
  grantee: tenantDid,
  contractId,
  functionName: fn,
  allowedHosts: [],
  validUntilSecs: Math.floor(Date.now() / 1000) + 3600,
}));

const customer = JSON.parse(readFileSync(join(ROOT, "contracts", "pii-shield", "examples", "customer.json"), "utf8"));
const r1 = await runAgentAction(grants, executor, {
  agentDid: tenantDid, contractId, functionName: "store", input: customer,
}, lastHash());
console.log("1. store ->", JSON.stringify(r1.result));

const r2 = await runAgentAction(grants, executor, {
  agentDid: tenantDid, contractId, functionName: "check",
  input: { rules: { min_age: 18, kyc_verified: true } },
}, lastHash());
console.log("2. check ->", JSON.stringify(r2.result));

const r3 = await runAgentAction(grants, executor, {
  agentDid: tenantDid, contractId, functionName: "redact",
  input: { text: "Hubungi Alex Example di alex@example.com, IBAN GB82WEST12345698765432." },
}, lastHash());
console.log("3. redact ->", JSON.stringify(r3.result));

const chain = verifyChain();
console.log(`\nAudit: ${readReceipts().length} receipt, rantai hash ${chain.ok ? "VALID" : "RUSAK"}.`);
console.log("Demo LIVE selesai.");
