# Architecture

## Overview

The Canton Control Kit MVP is a layered primitive stack:

1. `SmartAccount` enforces local account invariants such as nonce-based replay protection and submission formatting.
2. `PolicySafe` governs whether a submitted operation may execute.
3. `DemoTransfer` is only a proof target used to demonstrate how real application modules can plug into the same flow.

## Privacy Model

- `SafeAccount` is visible to the admin, application account party, and configured signers.
- `SafeProposal` is visible only to those same stakeholders.
- `SafeExecutionReceipt` preserves the same visibility boundary for auditability.
- Example transfer outputs are visible only to the parties that become stakeholders of those new contracts.

## Complementarity With BitSafe

BitSafe Decentralization Manager and Canton Control Kit solve different layers of control:

- BitSafe helps decentralize and coordinate party/operator hosting.
- `PolicySafe` applies application-level execution constraints such as multisig approval, timelocks, caps, and allowlists.

A co-hosted or decentralized party can therefore run on BitSafe-managed operational infrastructure while still using `PolicySafe` to require fine-grained approvals before application actions execute.

## Upgrade Direction

- Split `SmartAccount`, `PolicySafe`, `PartyRBAC`, `Tx Twin`, and `GraphPQS` into separate packages.
- Replace the demo operation dispatcher with a richer pluggable operation interface once the package boundaries stabilize.
- Add migration contracts and interface-based compatibility layers for future upgrades.
