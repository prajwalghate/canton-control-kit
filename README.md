# Canton Control Kit

Canton Control Kit is a modular open-source control plane for secure institutional applications on Canton and DAML.

It combines two tightly integrated layers:

- `Decentralized Party Hosting Layer`: governed co-hosting of the same party across multiple participant nodes
- `Application Execution Control Layer`: SmartAccount plus PolicySafe for proposal, approval, execution, and receipts

This pairing delivers defense-in-depth:

- infrastructure-level redundancy and decentralization
- fine-grained application-level execution governance

The project stands on its own. It is generic infrastructure, not a wallet, custody product, or end-user app.

## Current Focus

The repository now includes a proposal-ready MVP for:

- `DecentralizedParty`: co-hosted party metadata, hosting change requests, and topology submission audit records
- `PolicySafe`: threshold approvals and policy-governed execution for both application operations and hosting changes
- `SmartAccount`: nonce-gated operation submission anchored to a decentralized-party owner
- `DemoTransfer`: a minimal execution target used to prove the end-to-end flow

## Value Proposition

Institutional Canton deployments usually need two different kinds of control:

1. "Who is allowed to host and operate the party?"
2. "Who is allowed to execute sensitive business actions on behalf of the party?"

Canton Control Kit addresses both in one cohesive stack.

- `DecentralizedParty` governs the hosting configuration of the party itself
- `PolicySafe` governs execution of sensitive actions
- `SmartAccount` provides replay-protected submission into that governance path

## Repository Layout

- `daml/Core/Types.daml`: shared operation, envelope, approval, and receipt types
- `daml/PartyHosting/DecentralizedParty.daml`: co-hosted party state, hosting change requests, and hosting audit records
- `daml/Policy/PolicySafe.daml`: proposal, approval, execution, and execution receipts
- `daml/Account/SmartAccount.daml`: replay-protected account abstraction layer
- `daml/Identity/PartyRBAC.daml`: RBAC placeholder for later extension
- `daml/Examples/DemoTransfer.daml`: demo execution target
- `daml/Test/DecentralizedPartyTest.daml`: hosting governance and multi-hosted end-to-end flow
- `daml/Test/PolicySafeTest.daml`: policy-level tests
- `daml/Test/SmartAccountTest.daml`: smart-account tests
- `services/tx-twin/`: off-ledger simulation service area
- `sdk/typescript/`: TypeScript SDK and topology helper scaffolding
- `cli/`: CLI and local Canton topology templates
- `docs/`: architecture, onboarding, and operating notes

## Local Development

1. Install the Digital Asset toolchain version pinned in [`daml.yaml`](./daml.yaml).
2. Build the package:

```bash
dpm build
```

3. Run the DamlScript suite:

```bash
dpm test
```

4. For a single script:

```bash
dpm script --dar .daml/dist/canton-control-kit-0.1.0.dar --script-name Test.DecentralizedPartyTest:decentralizedPartyEndToEnd --ide-ledger
```

## Multi-Participant Local Topology

[`docker-compose.yml`](./docker-compose.yml) and [`docs/co-hosting.md`](./docs/co-hosting.md) now outline a local topology shape for:

- one domain node
- three participant nodes
- one additional participant slot for redundancy growth

The compose file is designed as a controlled starting point for local co-hosting experiments and proposal demonstrations.

## Status

The current implementation is intentionally minimal but strongly extensible:

- hosting changes are modeled as governed requests
- hosting requests can be executed through `PolicySafe`
- `SmartAccount` can be anchored to a decentralized-party owner
- DamlScript coverage includes hosting governance and co-hosted execution flow

Remaining future work includes richer policy plugins, live topology submission tooling, PartyRBAC integration, Tx Twin simulation, and GraphPQS.
