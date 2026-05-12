# Architecture

## Executive Summary

Canton Control Kit is an institutional control plane for Canton applications.

It combines:

1. `DecentralizedParty`: infrastructure governance for co-hosting a party across multiple participant nodes
2. `PolicySafe` plus `SmartAccount`: execution governance for sensitive business actions

That combination gives applications two complementary protection layers:

- resilience and decentralization at the hosting layer
- auditable execution policy at the application layer

## Layered Model

### Layer 1: Decentralized Party Hosting

This layer answers:

- which participant nodes are allowed to host the party
- which operators are associated with those hosts
- what confirmation threshold defines the hosting quorum
- how hosting changes are requested, approved, and audited

Primary DAML primitive:

- [`daml/PartyHosting/DecentralizedParty.daml`](/Users/prajwalghate/Documents/Work/canton/canton-control-kit/daml/PartyHosting/DecentralizedParty.daml)

### Layer 2: Execution Governance

This layer answers:

- who may submit an action request
- who must approve it
- when it becomes executable
- how the result is recorded

Primary DAML primitives:

- [`daml/Policy/PolicySafe.daml`](/Users/prajwalghate/Documents/Work/canton/canton-control-kit/daml/Policy/PolicySafe.daml)
- [`daml/Account/SmartAccount.daml`](/Users/prajwalghate/Documents/Work/canton/canton-control-kit/daml/Account/SmartAccount.daml)

## Core Flow

### Hosting Governance Flow

1. `DecentralizedParty` defines the current co-hosting set.
2. `partyAdmin` opens a `HostingChangeRequest`.
3. A separate `PolicySafe` proposal wraps the hosting request as a governed operation.
4. Signers approve.
5. `PolicySafe.Execute` applies the hosting change.
6. `DecentralizedParty` is recreated with a new hosting epoch.
7. A hosting receipt and optional topology submission records provide auditability.

### Application Execution Flow

1. `SmartAccount` accepts an `OperationEnvelope`.
2. Nonce and account binding are checked.
3. The envelope is forwarded into `PolicySafe`.
4. `SafeProposal` is created.
5. Signers approve.
6. `Execute` dispatches the operation.
7. `SafeExecutionReceipt` records the final outcome.

## Privacy Model

### Hosting Contracts

- `DecentralizedParty` is visible to the party admin, governed party, and configured host operators.
- `HostingChangeRequest` is visible only to hosting stakeholders who need to review the change.
- `HostingChangeReceipt` and `TopologySubmissionRecord` preserve the same boundary for auditability.

### Execution Contracts

- `SafeAccount` is visible to the safe admin, execution account party, and signers.
- `SafeProposal` stays within those same governance stakeholders.
- `SafeExecutionReceipt` preserves the same audit boundary.

### Business Contracts

- execution targets such as `DemoBalance` remain visible only to their own stakeholders

## Design Choices In The Current Version

### Snapshot-Based Proposal Model

`SafeProposal` captures the signer set and threshold at proposal creation time.

This keeps:

- approval semantics explicit
- audit history stable
- the MVP simple and compiler-friendly

### ContractId-Based Party Anchoring

`SmartAccount` can anchor itself to a live `DecentralizedParty` contract.

That gives the account layer a way to assert:

- the governed party matches the submitting party
- hosting is still operational

### Off-Ledger Topology Submission

Actual PartyToParticipant topology mappings must be pushed through the Canton Admin API.

The DAML layer does not attempt to submit topology transactions itself.

Instead it provides:

- governed hosting change requests
- hosting receipts
- topology submission audit records

The TS/CLI helpers are where admin-api submission logic belongs.

## Package Evolution

The architecture is intentionally modular so the major primitives can later split into independent packages:

- `@canton-control/decentralized-party`
- `@canton-control/policy-safe`
- `@canton-control/smart-account`
- `@canton-control/party-rbac`
- `@canton-control/tx-twin`

## Recommended Next Extensions

- policy-managed timelocks and amount caps
- hosting health attestations and liveness review
- SmartAccount session keys and sponsorship hooks
- PartyRBAC integration for delegated governance
- a real Tx Twin simulation service
- production-grade topology CLI workflows
