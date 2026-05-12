# Policy Engine

## Purpose

`PolicySafe` is the execution-governance core of Canton Control Kit.

It is intentionally generic:

- it can govern application actions such as transfers
- it can also govern infrastructure actions such as hosting changes

That makes it the bridge between secure infrastructure and secure application execution.

## Current Capabilities

- proposal creation
- threshold approvals
- proposal execution
- safe freeze and unfreeze
- signer rotation
- execution receipts
- governed hosting-change execution

## Current Rules

- only the bound execution account may propose and execute
- only configured signers may approve
- approvals are threshold-based
- the signer set must be unique
- proposals capture a snapshot of the safe state, signer set, and threshold

## Why This Matters

Institutional systems rarely fail because a single transfer function is missing.

They fail because there is no strong process around:

- who can request a sensitive action
- who must approve it
- whether approval state is auditable
- whether execution is separate from proposal

`PolicySafe` is designed to make those control points explicit.

## Governed Resources

In the current repository, `PolicySafe` can execute:

- `DemoTransferOp`
- `ApplyHostingChangeOp`

That second path is important. It means party-hosting changes are not treated as external governance theater. They are first-class governed operations in the same control plane.

## Planned Extensions

- timelocks
- amount caps
- counterparty allowlists
- richer denial receipts
- delegated approvals through `PartyRBAC`
- typed policy plugins through interfaces
