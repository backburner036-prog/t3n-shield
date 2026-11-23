// T3N Shield — P0 quickstart (diperbaiki r2 untuk SDK 5.41.0).
// Pola auth mengikuti README paket @terminal3/t3n-sdk 5.41.0:
// wasmComponent + handlers EthSign via metamask_sign. Skeleton P0 lama
// memakai `apiKey` di T3nClientConfig — field itu TIDAK ADA di 5.41.0.
// ATURAN: API key HANYA dari env (T3N_API_KEY). Jangan pernah tulis key ke file/repo.
import {
  T3nClient,
  setEnvironment,
  loadWasmComponent,
  resolveTrustAnchor,
  eth_get_address,
  metamask_sign,
  createEthAuthInput,
} from "@terminal3/t3n-sdk";

const T3N_API_KEY = process.env.T3N_API_KEY;
if (!T3N_API_KEY) {
  throw new Error("T3N_API_KEY belum di-set di environment. Klaim di claim page Terminal 3.");
}

setEnvironment("testnet"); // eksplisit: target cluster tidak ambigu
const wasmComponent = await loadWasmComponent();

const trustAnchor = await resolveTrustAnchor("testnet"); // wajib — client throw tanpa ini
const address = eth_get_address(T3N_API_KEY);
const t3n = new T3nClient({
  trustAnchor,
  wasmComponent,
  handlers: { EthSign: metamask_sign(address, undefined, T3N_API_KEY) },
});
await t3n.handshake();

const did = await t3n.authenticate(createEthAuthInput(address));
console.log("Authenticated. tenantDid =", did.value);
console.log("P0 OK — langkah berikut: TenantClient + klaim test credits (lihat PLAN.md P1).");
