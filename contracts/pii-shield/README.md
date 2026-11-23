# pii-shield — T3N Shield TEE contract

Fork of the [Terminal 3 ADK walkthrough](https://docs.terminal3.io/developers/adk/get-started/walkthrough/write-contract)
reference (`Terminal-3/agent-vault-starter`, Apache-2.0), extended with PII
redaction. Part of **T3N Shield** for the Terminal 3 Build+Scale Agent
Micro Grant (DoraHacks).

A customer stores a bank-style record about themselves (name, date of birth,
address, ID document, KYC status, account and income) inside the T3N enclave.
An agent the customer has granted can ask yes/no questions about it and gets
booleans back. It never sees a value. **New:** the agent can also ask the
contract to redact the customer's PII out of free text — the contract
replaces each stored value with a `[FIELD]` placeholder, inside the enclave.

| Function | Who may call it | What it does |
|---|---|---|
| `store` | The customer, for themselves | Validates the record and saves it to `z:<tid>:shield` under the customer's DID |
| `check` | The customer, or an agent they granted | Answers the rules asked with `true` / `false` |
| `redact` | The customer, or an agent they granted | Returns the input text with stored PII replaced by `[FIELD]` placeholders + per-field counts |
| `forget` | The customer, for themselves | Deletes the customer's record |

`examples/customer.json` is a fictional customer; `examples/rules.json` is a `check` input.

## Rules (`check`)

| Rule | Example | True when |
|---|---|---|
| `min_age` | `18` | The customer is at least this old today |
| `residency_in` | `["GB", "IE"]` | The residential address country is in the list |
| `nationality_in` | `["GB"]` | The nationality is in the list |
| `kyc_verified` | `true` | KYC status is `verified` |
| `id_not_expired` | `true` | The ID document expires today or later |
| `min_balance_cents` | `100000` | The account balance is at least this, in minor units |
| `min_monthly_income_cents` | `300000` | Monthly net income is at least this, in minor units |
| `account_open_min_months` | `12` | The account has been open at least this many whole months |
| `employed` | `true` | Employment status is `employed` or `self_employed` |

## Redaction (`redact`)

Input: `{ "text": "...", "fields": ["email", "phone"] }` (`fields` optional —
default: all 10 redactable fields). Only stored values of length ≥ 4 are
replaced (longest first), so short substrings are never scrubbed. Output:
`{ "redacted": "...", "custom": { "vault_op": "redact", "fields_redacted": "3" } }`.
Errors name the field, never the value. Text over 100,000 bytes is rejected.

## Build & test

```bash
rustup target add wasm32-wasip2
cargo test --release          # 14 tests (incl. 3 redact tests)
cargo build --target wasm32-wasip2 --release
# -> target/wasm32-wasip2/release/pii_shield.wasm
```

Prebuilt release artifact: `release/pii_shield.wasm`
(SHA-256 `bb677830b1dabf2a19c28cb505d4157ea9faac02ab664223a115a93bea7aa249`).

## Design rules (from the walkthrough, kept)

- Export functions on the `contracts` interface; each takes `generic-input`
  and returns `result<list<u8>, string>` — JSON bytes on success.
- `kv-store` calls take the full `z:<tid>:<map>` name; the map must exist
  before the first call (created by `src/deploy.ts` in the parent project).
- Key data by `calling_user_did()`, never by a DID taken from the input.
- Return answers, not values; never put a value in a log line, an error,
  or a `custom` label. No `http` import — nothing stored can leave the enclave.
