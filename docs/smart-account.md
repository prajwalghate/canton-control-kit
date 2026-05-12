# Smart Account

## Purpose

`SmartAccount` is the account-abstraction edge of the MVP. It does not decide whether an operation is allowed. Instead, it:

- validates the envelope account binding
- enforces monotonic nonces for replay protection
- forwards the operation to the linked `PolicySafe`

## Current MVP Behavior

- Single account party submits the envelope.
- Nonce must match `nextNonce`.
- The linked policy safe is held by contract id and refreshed on each successful submission.

## Planned Extensions

- batched operations with richer receipts
- session keys with constrained scope
- sponsorship hooks
- policy hook interfaces
- typed operation registries
