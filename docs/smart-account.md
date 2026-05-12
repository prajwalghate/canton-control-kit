# Smart Account

## Purpose

`SmartAccount` is the account-abstraction edge of Canton Control Kit.

It does not decide whether an operation is allowed. Instead it:

- validates the envelope/account binding
- enforces monotonic nonces for replay protection
- optionally validates a decentralized-party owner anchor
- forwards the request to `PolicySafe`

## Current Fields

- `accountId`
- `admin`
- `account`
- `ownerPartyId`
- `ownerPartyCid`
- `policySafeCid`
- `nextNonce`

## Owner Anchoring

The new piece in this version is the optional owner-party anchor.

When configured, `SubmitOperation` checks that:

- the linked `DecentralizedParty` still governs the same DAML party
- the configured owner party id matches
- the hosting state is still operational

This lets the account layer consume infrastructure governance as an input.

## Submission Flow

`SubmitOperation` performs the following checks:

1. envelope `accountId` matches the smart account
2. `submittedBy` matches the bound account party
3. `nonce` matches `nextNonce`
4. owner anchor is valid, if configured

After that it:

- exercises `PolicySafe.ProposeOperation`
- refreshes its linked `policySafeCid`
- increments `nextNonce`

## Why The Contract Recreates Itself

Like the other DAML primitives in this repository, `SmartAccount` uses archive-and-recreate semantics to represent state changes cleanly and explicitly.

That makes replay state transparent and auditable.

## Future Extensions

- session keys
- sponsorship hooks
- richer batched execution metadata
- interface-based policy hooks
- owner-party refresh automation after hosting reconfiguration
