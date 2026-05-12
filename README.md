# Canton Control Kit

Canton Control Kit is a modular open-source primitive stack for building safer institutional applications on Canton and DAML.

It provides reusable building blocks for smart accounts, policy-gated execution, multisig approvals, role-based permissions, transaction simulation, and privacy-aware queries.

**First MVP**: Policy-Gated Smart Account with proposal/approval/execution flow + execution receipts.

This is infrastructure, not a wallet or app. Applications compose these primitives into their own workflows.

## MVP Scope

The initial repository implements a minimal but working primitive stack for:

- `Smart Account Kernel`: nonce-gated operation submission that delegates execution control to policy.
- `PolicySafe`: application-level multisig with proposal, approval, execute, freeze, unfreeze, and signer rotation.
- `DemoTransfer`: a tiny example operation target used to prove the end-to-end flow locally.
- `Tx Twin`: reserved as an off-ledger service area for simulation and privacy-impact previews.

## Design Principles

- Start minimal and modular so each primitive can later become its own package.
- Use `Propose -> Approve -> Execute` flows rather than embedding privileged direct execution paths.
- Keep replay protection mandatory on the smart-account layer.
- Respect Canton privacy by making proposals and receipts visible only to the minimum stakeholder set.
- Stay explicitly complementary to BitSafe Decentralization Manager. BitSafe can decentralize party hosting and operational control, while `PolicySafe` adds fine-grained application execution policy on top of those co-hosted or decentralized parties.

## Repository Layout

- `daml/Core/Types.daml`: shared types for operations, approvals, receipts, and policy checks.
- `daml/Account/SmartAccount.daml`: smart-account submission and nonce management.
- `daml/Policy/PolicySafe.daml`: multisig policy safe and proposal lifecycle.
- `daml/Examples/DemoTransfer.daml`: demo operation target for local end-to-end tests.
- `daml/Test/*.daml`: DamlScript tests.
- `docs/`: architectural notes and contributor guidance.
- `docs/new-dev-guide.md`: onboarding guide for developers new to Canton and this repo.

## Local Development

1. Install a DAML SDK that matches `sdk-version` in [`daml.yaml`](./daml.yaml).
2. Build the package with `dpm build`.
3. Run the example scripts with:

```bash
dpm test
```

4. Or run individual scripts explicitly with an IDE ledger:

```bash
dpm script --dar .daml/dist/canton-control-kit-0.1.0.dar --script-name Test.PolicySafeTest:policySafeEndToEnd --ide-ledger
dpm script --dar .daml/dist/canton-control-kit-0.1.0.dar --script-name Test.SmartAccountTest:smartAccountEndToEnd --ide-ledger
```

5. Use [`docker-compose.yml`](./docker-compose.yml) as the starting point for a local Canton node topology once the Docker images and local config are wired in your environment.

## Status

This MVP is intentionally narrow: one policy-gated smart-account flow, a demo operation type, and test coverage focused on authorization, nonce handling, and proposal execution. The current phase keeps proposal enforcement snapshot-based and avoids contract keys so the package remains compatible with the local compiler feature set we verified here.
