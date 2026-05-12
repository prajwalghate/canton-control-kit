# New Developer Guide

This guide is for a developer who is new to Canton or new to this repository and wants to understand what this project does, how the code is structured, and how the MVP flow works.

## What This Project Is

Canton Control Kit is reusable infrastructure for Canton and DAML applications.

It is not:

- a wallet
- a custody product
- a token standard
- an end-user app

It is:

- a smart-account primitive
- a policy-gated execution primitive
- a place to add reusable institutional safety controls

The current MVP is intentionally narrow:

- a `SmartAccount` accepts an operation envelope
- the envelope is checked for replay protection with a nonce
- the operation is handed to `PolicySafe`
- `PolicySafe` creates a proposal
- signers approve the proposal
- the proposal executes
- an execution receipt is created

## The Most Important New Term: Proposal

For a new Canton/DAML developer, `proposal` is worth learning early because it appears constantly in serious workflows.

In this repo, a proposal does not mean "some arbitrary transaction happened."

It means:

- a contract that represents a pending request to execute some future action
- a structured approval workflow around that future action
- a place to collect evidence before the action is allowed to happen

In this MVP, the proposal is the `SafeProposal` contract.

### Short answer

- a `choice` is an action you try to exercise on a live contract
- a `transaction` is the ledger result of a submitted command
- a `proposal` is a contract representing "this action is requested but not yet authorized for execution"

So the proposal is not "any choice tx".

More precisely:

- submitting the proposal is itself one transaction
- approving the proposal is another transaction
- executing the approved proposal is another transaction

The proposal is the workflow object that connects those transactions together.

### Analogy

Think of a proposal like a change request in an institutional system.

- `SmartAccount` = the front desk that accepts a request and checks the request format
- `SafeProposal` = the change ticket opened for review
- `Approve` = a reviewer signing off
- `Execute` = the approved change being applied
- `SafeExecutionReceipt` = the audit record showing what actually happened

That is why proposal-based patterns fit institutional Canton applications so well. They create a clean separation between:

- requesting an action
- authorizing an action
- performing the action
- recording the result

## Canton and DAML Mental Model

If you are coming from Solidity, backend systems, or ordinary databases, the most important shift is this:

- in DAML, your main unit of state is a contract
- contracts have explicit stakeholders
- choices are the only way to change state
- when state changes, the old contract is often archived and a new one is created
- visibility is built into the data model rather than added later

For this repo, that means:

- `SafeAccount` is a live policy configuration contract
- `SafeProposal` is a separate contract representing an in-flight approval process
- `SafeExecutionReceipt` is a separate audit record
- `SmartAccount` is a separate contract that tracks `nextNonce`

### Important Canton terms

- `Party`: a legal or application identity on the ledger
- `signatory`: a party that authorizes the contract and is always a stakeholder
- `observer`: a party that can see the contract but does not authorize it
- `controller`: the party allowed to exercise a choice
- `ContractId`: a pointer to a specific live contract
- `choice`: a typed action on a contract
- `command`: what an app submits to the ledger API
- `transaction`: the ledger event produced after commands are interpreted and accepted
- `stakeholders`: parties that can see a contract because they are signatories or observers

## The Basic Canton Transaction Flow

If you are new to Canton, this is the simplest useful model:

1. Your app submits a command.
2. The command usually says "exercise this choice" or "create this contract".
3. Canton interprets the command against the contracts visible to the acting parties.
4. Authorization rules are checked.
5. The resulting creates, exercises, and archives become a transaction.
6. Only the relevant stakeholders learn about the resulting contracts and events.

In other words:

- app submits a command
- DAML computes the allowed state transition
- Canton commits the transaction with privacy

### In DAML, a transaction usually comes from a choice

This is the core pattern:

- there is a live contract
- someone exercises a choice on it
- the choice code runs
- the choice may archive old contracts
- the choice may create new contracts

That whole result is the transaction.

### Why this feels different from EVM systems

In Solidity, people often think in terms of:

- one global shared state
- one contract method call mutating that state

In DAML/Canton, think instead in terms of:

- many contracts, each with explicit stakeholders
- each contract representing a small piece of state
- choices producing state transitions by archiving and creating contracts
- visibility constrained by stakeholder rules

## The DAML "Loop"

When people are new to DAML, it helps to think of the normal contract lifecycle as a loop:

1. create a contract
2. exercise a choice on that contract
3. archive the old contract if the state changed
4. create a new contract representing the updated state
5. continue from that new contract

That is the standard workflow loop in DAML.

This repo uses that loop everywhere:

- `SmartAccount` is recreated with a new `nextNonce`
- `SafeAccount` is recreated with a new `proposalCounter` or new state
- `SafeProposal` is recreated when approvals are added

This is normal. It is not wasteful or accidental. It is how explicit state transitions are modeled in DAML.

### Analogy

Think of each live contract as the current signed version of a document.

When something changes, you do not scribble over the old signed document.

Instead you:

- retire the old signed version
- issue a new signed version

That is very close to how DAML models state changes.

## What The MVP Tries To Prove

The MVP is proving one core idea:

Applications on Canton can separate submission from authorization.

Instead of letting an application actor directly execute a sensitive action, we make them:

1. submit a typed operation through `SmartAccount`
2. create a policy proposal in `PolicySafe`
3. gather approvals
4. execute only after the policy threshold is met

That is the base pattern we can later extend with:

- session keys
- sponsorship
- timelocks
- amount caps
- allowlists
- richer policy checks
- RBAC
- transaction simulation

## How A Transaction Moves Through This Repo

Here is the concrete flow for the MVP.

### Step 1: submit through `SmartAccount`

The app exercises `SubmitOperation` on `SmartAccount`.

That transaction:

- checks `accountId`
- checks `submittedBy`
- checks the `nonce`
- forwards the request into `PolicySafe`
- recreates `SmartAccount` with `nextNonce + 1`

At this point, the real business action has not executed yet.

What happened instead is:

- a valid request was accepted
- a proposal was opened

### Step 2: proposal gets created

Inside `PolicySafe`, `ProposeOperation` creates a `SafeProposal`.

That proposal contains:

- the requested operation batch
- the signer snapshot
- the threshold snapshot
- proposal metadata

This proposal is now the object everyone approves against.

### Step 3: signers approve

Each signer exercises `Approve` on the current `SafeProposal`.

Each approval is its own transaction.

Each time:

- the old proposal is archived
- a new proposal is created with one more approval
- status is recomputed

Once approvals reach the threshold, the proposal becomes `ReadyToExecute`.

### Step 4: the approved proposal executes

The account party exercises `Execute` on the final proposal.

That transaction:

- validates the threshold has been met
- dispatches the requested operation
- creates `SafeExecutionReceipt`
- archives the proposal

This is the transaction where the underlying business action really happens.

### Step 5: stakeholders see only what they should

Because Canton is privacy-aware:

- policy stakeholders see the proposal and receipt
- asset stakeholders see the asset state relevant to them
- unrelated parties do not automatically see everything

That is one of the biggest advantages of modeling workflows carefully in DAML.

## Repo Analogies

These analogies are not perfect, but they help new devs build intuition quickly.

- `SmartAccount` is like an API gateway plus replay guard
- `PolicySafe` is like an approval engine or institutional rulebook
- `SafeProposal` is like a change ticket or approval packet
- `Approve` is like a signer applying a signature to the ticket
- `Execute` is like releasing the approved action into production
- `SafeExecutionReceipt` is like an immutable audit log entry
- `DemoBalance` is like a tiny demo asset position used to prove the plumbing

## Repository Map

- [`README.md`](/Users/prajwalghate/Documents/Work/canton/canton-control-kit/README.md): top-level project overview
- [`daml/Core/Types.daml`](/Users/prajwalghate/Documents/Work/canton/canton-control-kit/daml/Core/Types.daml): shared domain types
- [`daml/Account/SmartAccount.daml`](/Users/prajwalghate/Documents/Work/canton/canton-control-kit/daml/Account/SmartAccount.daml): smart-account abstraction and nonce logic
- [`daml/Policy/PolicySafe.daml`](/Users/prajwalghate/Documents/Work/canton/canton-control-kit/daml/Policy/PolicySafe.daml): multisig-style proposal, approval, execute, freeze, rotate signer
- [`daml/Examples/DemoTransfer.daml`](/Users/prajwalghate/Documents/Work/canton/canton-control-kit/daml/Examples/DemoTransfer.daml): tiny demo asset transfer target used by the tests
- [`daml/Test/PolicySafeTest.daml`](/Users/prajwalghate/Documents/Work/canton/canton-control-kit/daml/Test/PolicySafeTest.daml): policy-level end-to-end scripts
- [`daml/Test/SmartAccountTest.daml`](/Users/prajwalghate/Documents/Work/canton/canton-control-kit/daml/Test/SmartAccountTest.daml): smart-account end-to-end scripts
- [`docs/architecture.md`](/Users/prajwalghate/Documents/Work/canton/canton-control-kit/docs/architecture.md): high-level architecture notes

## The Core Types

[`daml/Core/Types.daml`](/Users/prajwalghate/Documents/Work/canton/canton-control-kit/daml/Core/Types.daml) defines the vocabulary shared by the account and policy layers.

The main types are:

- `Threshold`: how many approvals are required
- `SafeState`: whether the safe is active or frozen
- `ProposalStatus`: whether a proposal is still pending or ready to execute
- `Approval`: one signer approval with timestamp and optional note
- `OperationEnvelope`: the submitted batch wrapper
- `Operation`: the actual action to take
- `ExecutionReceipt`: the audit output after execution

### Why `OperationEnvelope` matters

`OperationEnvelope` is the unit submitted through the smart account. It includes:

- `operationId`: application-level identifier
- `accountId`: binds the operation to one smart account
- `nonce`: replay protection
- `operations`: a list so batching is possible later
- `submittedBy`: who submitted it
- `description`, `sessionKey`, `sponsor`: reserved for richer account abstraction later

In the MVP, `Operation` has only one case:

- `DemoTransferOp DemoTransferCall`

That is deliberate. We are proving the control flow before adding more operation types.

Another way to say it:

- the envelope describes the requested action batch
- the proposal governs whether that batch is allowed
- execution turns the approved batch into a real ledger transaction

## How `SmartAccount` Works

See [`daml/Account/SmartAccount.daml`](/Users/prajwalghate/Documents/Work/canton/canton-control-kit/daml/Account/SmartAccount.daml).

`SmartAccount` is small on purpose. It does not decide whether an operation is allowed. Its job is:

- bind an `accountId` to an `account` party
- track `nextNonce`
- hold the current `policySafeCid`
- forward validated submissions into `PolicySafe`

### Fields

- `accountId`: stable application account identifier
- `admin`: party that deploys and governs the smart account contract
- `account`: party allowed to submit operations
- `policySafeCid`: live `SafeAccount` contract this smart account delegates to
- `nextNonce`: next acceptable nonce

### `SubmitOperation`

The only public choice in the MVP is `SubmitOperation`.

It checks:

- the envelope `accountId` matches the contract `accountId`
- `submittedBy` matches the bound `account`
- `nonce` matches `nextNonce`

If those checks pass, it exercises `Policy.ProposeOperation` on the linked safe and then recreates itself with:

- `nextNonce + 1`
- the updated `policySafeCid` returned by `PolicySafe`

That recreate pattern is classic DAML. Mutable state is represented by archiving the old contract and creating a new one.

## How `PolicySafe` Works

See [`daml/Policy/PolicySafe.daml`](/Users/prajwalghate/Documents/Work/canton/canton-control-kit/daml/Policy/PolicySafe.daml).

This module is the policy engine for the MVP.

It contains three main templates:

- `SafeAccount`: live safe configuration
- `SafeProposal`: in-flight proposal requiring approvals
- `SafeExecutionReceipt`: audit output after execution

If you want the one-line summary:

- `SmartAccount` says "is this request well-formed and fresh?"
- `PolicySafe` says "is this request allowed?"

### `SafeAccount`

This is the main policy config contract.

Key fields:

- `safeId`: safe identifier
- `safeAdmin`: party allowed to administer the safe
- `accountParty`: application party allowed to propose and execute
- `signers`: signer set
- `threshold`: required approval count
- `state`: active or frozen
- `proposalCounter`: monotonically increasing proposal number

Important choices:

- `ProposeOperation`
- `FreezeSafe`
- `UnfreezeSafe`
- `RotateSigner`

### `ProposeOperation`

This is where the smart account hands control over to policy.

It checks:

- threshold is internally valid
- the operation batch is non-empty
- the safe is active
- envelope `accountId` matches the safe
- `submittedBy` matches `accountParty`

Then it creates a `SafeProposal` and recreates the safe with an incremented `proposalCounter`.

Notice the return type:

```daml
(ContractId SafeAccount, ContractId SafeProposal)
```

That is why `SmartAccount` stores the new safe cid after every submission.

### `SafeProposal`

This contract models the `Propose -> Approve -> Execute` lifecycle.

Key fields:

- proposal snapshot of `signers`, `threshold`, and `state`
- `approvals`
- `status`
- `envelope`

That snapshot-based design is important for the current MVP.

At the moment:

- new proposals use the current safe configuration
- existing proposals continue using the snapshot captured at creation time

This is simpler than live configuration resolution and keeps the MVP compiler-friendly.

For a new dev, the key intuition is:

- `SafeProposal` is the waiting room between request and execution

### `Approve`

`Approve` checks:

- signer is in the signer set
- signer has not already approved
- the proposal snapshot was created from an active safe

It then appends an `Approval`, recomputes the status, archives the old proposal, and creates the new one.

### `Execute`

`Execute` checks:

- threshold definition is valid
- proposal status is `ReadyToExecute`
- proposal snapshot was created from an active safe

It then:

- iterates through the batched operations
- dispatches each operation
- creates a `SafeExecutionReceipt`
- archives the proposal

This is the most important distinction in the whole repo:

- proposal creation is not the same as business execution
- approval is not the same as business execution
- only `Execute` actually performs the requested operation

## How Operation Dispatch Works

Look at `executeOperation` in [`daml/Policy/PolicySafe.daml`](/Users/prajwalghate/Documents/Work/canton/canton-control-kit/daml/Policy/PolicySafe.daml).

Right now it supports one operation:

```daml
DemoTransferOp transfer
```

That calls the `Transfer` choice on [`DemoBalance`](/Users/prajwalghate/Documents/Work/canton/canton-control-kit/daml/Examples/DemoTransfer.daml).

This is the place where future integration points will grow. For example:

- token transfers
- settlement instructions
- treasury movements
- controlled application actions

The important design point is that `PolicySafe` executes a typed operation, not an unstructured blob.

## The Demo Transfer Module

[`daml/Examples/DemoTransfer.daml`](/Users/prajwalghate/Documents/Work/canton/canton-control-kit/daml/Examples/DemoTransfer.daml) is not the product. It is a proof target.

`DemoBalance` is a simple contract with:

- `issuer`
- `owner`
- `asset`
- `amount`

The `Transfer` choice:

- requires `owner` as controller
- archives the source balance
- creates a recipient balance
- optionally creates a remainder balance

Why this exists:

- it gives the MVP a real execution target
- it lets tests prove balance movement
- it avoids coupling the first version to a token standard too early

## End-To-End Flow

Here is the MVP flow in plain English.

1. Admin creates `SafeAccount`.
2. Admin creates `SmartAccount` linked to that `SafeAccount`.
3. Account party submits an `OperationEnvelope` through `SmartAccount`.
4. `SmartAccount` validates the nonce and forwards to `PolicySafe`.
5. `PolicySafe` creates a `SafeProposal`.
6. Signers approve the proposal.
7. Once approvals meet the threshold, the proposal becomes executable.
8. The account party executes the proposal.
9. The underlying operation runs.
10. `SafeExecutionReceipt` is created for auditability.

If you want to map those steps to Canton transaction boundaries:

1. `Create SafeAccount`
2. `Create SmartAccount`
3. `SubmitOperation` transaction
4. `Approve` transaction
5. `Approve` transaction
6. `Execute` transaction

## How Privacy Works Here

Canton privacy is not an afterthought. It follows directly from stakeholders.

### `SafeAccount`

- signatory: `safeAdmin`
- observers: `accountParty`, `signers`

Meaning:

- admin sees and controls it
- the application account and signers can see it

### `SafeProposal`

- signatory: `proposalAdmin`
- observers: `proposalAccount`, `signers`

Meaning:

- only direct policy stakeholders can see proposal details

### `SafeExecutionReceipt`

- signatory: `receiptAdmin`
- observers: `receiptAccount`, `signers`

Meaning:

- audit visibility stays inside the same policy boundary

### `DemoBalance`

- signatory: `owner`
- observer: `issuer`

Meaning:

- the recipient sees only the balance they receive
- they do not automatically see the sender's full state

## Tests You Should Read First

If you are onboarding, the tests are the fastest way to understand intent.

Start with:

- [`daml/Test/PolicySafeTest.daml`](/Users/prajwalghate/Documents/Work/canton/canton-control-kit/daml/Test/PolicySafeTest.daml)
- [`daml/Test/SmartAccountTest.daml`](/Users/prajwalghate/Documents/Work/canton/canton-control-kit/daml/Test/SmartAccountTest.daml)

What they cover:

- successful policy proposal, approval, and execution
- receipt creation
- balance transfer effect
- freeze blocking new proposals
- nonce replay failure

Read them with this question in mind:

"At this step, is the code opening a request, approving a request, or actually executing the business action?"

## How To Build and Run

From the repo root:

```bash
dpm build
```

Run tests:

```bash
dpm test
```

Run a single script on the IDE ledger:

```bash
dpm script --dar .daml/dist/canton-control-kit-0.1.0.dar --script-name Test.SmartAccountTest:smartAccountEndToEnd --ide-ledger
```

## Known MVP Simplifications

These are intentional and worth understanding before you extend the code:

- only one operation type exists
- proposal enforcement is snapshot-based
- contract keys are intentionally avoided in this version
- `PartyRBAC` and `Tx Twin` are still placeholders
- `docker-compose.yml` is a starting point, not a finished production topology
- templates and tests currently live in one package

## How To Extend This Safely

If you are adding a new feature, the safest order is:

1. add a new typed payload in [`daml/Core/Types.daml`](/Users/prajwalghate/Documents/Work/canton/canton-control-kit/daml/Core/Types.daml)
2. add a new `Operation` case
3. extend `executeOperation` in [`daml/Policy/PolicySafe.daml`](/Users/prajwalghate/Documents/Work/canton/canton-control-kit/daml/Policy/PolicySafe.daml)
4. add or update a DamlScript test
5. document authorization and privacy implications in comments

When changing templates or choices, always ask:

- who is the signatory?
- who are the observers?
- who controls this choice?
- who should and should not learn this data on Canton?
- does this create replay, stale state, or visibility risk?

## What To Read Next

- [`docs/architecture.md`](/Users/prajwalghate/Documents/Work/canton/canton-control-kit/docs/architecture.md)
- [`docs/smart-account.md`](/Users/prajwalghate/Documents/Work/canton/canton-control-kit/docs/smart-account.md)
- [`docs/policy-engine.md`](/Users/prajwalghate/Documents/Work/canton/canton-control-kit/docs/policy-engine.md)
- official Canton and DAML docs:
  [Canton Overview](https://docs.digitalasset.com/overview/3.4/index.html)
  [Daml Script](https://docs.digitalasset.com/build/3.4/tutorials/smart-contracts/tests.html)
  [DPM](https://docs.digitalasset.com/build/3.4/dpm/dpm.html)
