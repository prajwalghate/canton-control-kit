# Policy Engine

## Purpose

`PolicySafe` is application-level execution control. It is not party custody or operator control. It is meant to sit above participant hosting and below application business logic.

## MVP Rules

- only the bound application account can propose and execute
- only configured signers can approve
- approvals are threshold-based
- freeze blocks new proposals
- approvals and execution are validated against the safe snapshot captured at proposal time

## Why Propose -> Approve -> Execute

This pattern fits DAML well because it makes authorization and visibility explicit. Each stage becomes auditable, and contract stakeholders are easy to reason about under Canton privacy rules.

## Planned Extensions

- timelocks
- amount caps
- counterparty allowlists
- richer policy-failure receipts
- delegated approvals through `PartyRBAC`
