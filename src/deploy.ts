// T3N Shield — P1 deploy: autentikasi + TenantClient + register kontrak
// pii-shield + buat map `shield` (private, hanya kontrak yang baca/tulis).
//
// Pemakaian (butuh T3N_API_KEY dari env — klaim gratis di claim page
// Terminal 3; key TIDAK PERNAH ditulis ke file/repo):
//   npx tsx src/deploy.ts [--register]
// Tanpa --register: hanya cek auth + TenantClient (aman diulang).
// Dengan --register: upload WASM + buat map; contract_id dicetak SEKALI —
// simpan ke DEPLOY.md (T3N tidak menyediakan call untuk lookup nanti).
//
// Prasyarat: cargo build --target wasm32-wasip2 --release di
// contracts/pii-shield (lihat contracts/pii-shield/README.md).

import { existsSync, readFileSync, writeFileSync } from "node:fs";
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

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TAIL = "shield";
const VERSION = "0.1.0";
const WASM_TARGET = join(ROOT, "contracts", "pii-shield", "target", "wasm32-wasip2", "release", "pii_shield.wasm");
const WASM_RELEASE = join(ROOT, "contracts", "pii-shield", "release", "pii_shield.wasm");
const WASM_PATH = existsSync(WASM_TARGET) ? WASM_TARGET : WASM_RELEASE;

const T3N_API_KEY = process.env.T3N_API_KEY;
if (!T3N_API_KEY) {
  throw new Error("T3N_API_KEY belum di-set. Klaim gratis di https://www.terminal3.io/claim-page lalu export T3N_API_KEY=...");
}

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
console.log("TenantClient ready.");

if (!process.argv.includes("--register")) {
  console.log("OK (tanpa --register: tidak ada yang di-upload). Jalankan dengan --register untuk deploy kontrak.");
  process.exit(0);
}

const wasm = new Uint8Array(readFileSync(WASM_PATH));
console.log(`Registering tail=${TAIL} version=${VERSION} wasm=${wasm.length} bytes ...`);
const reg = await tenant.contracts.register({ tail: TAIL, version: VERSION, wasm });
console.log("Registered:", reg.name, "contract_id =", reg.contract_id);

try {
  await tenant.maps.create({
    tail: TAIL,
    visibility: "private",
    readers: { only: [reg.contract_id] },
    writers: { only: [reg.contract_id] },
  });
  console.log(`Map z:<tid>:${TAIL} dibuat (private, hanya kontrak ${reg.contract_id}).`);
} catch (e) {
  const msg = String((e as Error)?.message ?? e);
  if (msg.includes("already exists")) {
    await tenant.maps.update(TAIL, {
      readers: { only: [reg.contract_id] },
      writers: { only: [reg.contract_id] },
    });
    console.log(`Map sudah ada — readers/writers diperbarui ke kontrak ${reg.contract_id}.`);
  } else {
    throw e;
  }
}

writeFileSync(
  join(ROOT, "DEPLOY.md"),
  `# Deploy T3N Shield (testnet)\n\n- tenantDid: \`${tenantDid}\`\n- contract: \`z:<tid>:${TAIL}\` — contract_id \`${reg.contract_id}\`, version \`${VERSION}\`\n- map: \`z:<tid>:${TAIL}\` (private, readers/writers = kontrak ${reg.contract_id} saja)\n- wasm: \`contracts/pii-shield/target/wasm32-wasip2/release/pii_shield.wasm\` (${wasm.length} bytes)\n- dideploy: ${new Date().toISOString()}\n`,
);
console.log("DEPLOY.md ditulis. contract_id =", reg.contract_id);
