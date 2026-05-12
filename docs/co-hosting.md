# Co-Hosting

## Why Co-Hosting Matters

Institutional Canton deployments often want the same party to be hosted by more than one participant node.

Reasons include:

- operational redundancy
- distributed trust
- reduced single-operator risk
- governance over topology changes

In Canton Control Kit, co-hosting is not treated as an external concern. It is part of the control plane.

## What `DecentralizedParty` Represents

[`daml/PartyHosting/DecentralizedParty.daml`](/Users/prajwalghate/Documents/Work/canton/canton-control-kit/daml/PartyHosting/DecentralizedParty.daml) models the hosted-party control surface.

It tracks:

- the governed party
- the set of hosting participants
- the operator party associated with each host
- a hosting confirmation threshold
- a hosting epoch for stale-request detection
- an auditable stream of hosting-change requests and receipts

## Hosting Participants

Each hosting participant carries:

- `participantId`
- `operatorParty`
- `adminApiUrl`
- `role`
- `permissions`

The current role model is lightweight by design:

- `TopologyLeader`
- `VotingHost`
- `RecoveryHost`

The permissions list is also intentionally simple:

- `SubmitTopologyTransactions`
- `ObserveTopologyAudit`
- `ConfirmHostingHealth`

## Governed Hosting Changes

Sensitive hosting changes should never happen as direct privileged mutations.

In this design:

1. `partyAdmin` opens a `HostingChangeRequest`
2. `PolicySafe` wraps that request inside a governed proposal
3. signers approve
4. `PolicySafe.Execute` exercises `HostingChangeRequest.Apply`
5. the old `DecentralizedParty` is archived and a new one is created with a higher epoch

Supported hosting changes in the current code:

- add host
- remove host
- rotate host operator
- change host role
- change confirmation threshold
- move hosting state between operational and maintenance

## Why Hosting Epoch Exists

Each `DecentralizedParty` has a `hostingEpoch`.

That gives us a lightweight stale-request defense:

- request A is opened against epoch 0
- request B is later applied and moves the party to epoch 1
- request A can no longer be applied because it targets the old epoch

This matters because hosting governance is exactly the kind of workflow where stale approvals become dangerous.

## Topology Submission Model

The DAML model does not directly call the Canton Admin API.

Instead:

- DAML governs whether a hosting change should happen
- TypeScript and CLI helpers perform the actual admin-api submission
- DAML records the submission reference through `TopologySubmissionRecord`

That separation is intentional.

The ledger should decide:

- whether the change is authorized
- what the approved hosting state is

The off-ledger helper should handle:

- admin-api auth
- PartyToParticipant mapping payloads
- retries and environment-specific transport details

## Local Topology Shape

The repository’s local topology is oriented around:

- `domain`
- `participant1`
- `participant2`
- `participant3`
- `participant4` as an optional expansion slot

This is enough to demonstrate:

- 3-host initial co-hosting
- 2-of-3 governance
- add-host evolution to 4 hosts

## Local Development Notes

The compose and config templates are meant to be understandable and easy to adapt, not a full production deployment.

For a local demonstration flow:

1. start the domain and participants
2. allocate the governed party
3. push initial PartyToParticipant mappings through the admin API
4. create the `DecentralizedParty` DAML contract reflecting that topology
5. use `PolicySafe` to govern future hosting changes
6. record topology submissions with `RecordTopologySubmission`

## Operating Model

The practical operating loop looks like this:

1. open a hosting change request on-ledger
2. approve it through `PolicySafe`
3. execute it on-ledger
4. submit the real topology transaction off-ledger
5. record the topology submission reference on-ledger

That gives:

- governance and auditability in DAML
- real infrastructure control via Canton admin APIs

## Relationship To Smart Accounts

`SmartAccount` can anchor itself to a `DecentralizedParty` owner.

That means the execution-control layer can assert:

- the governed party matches the account party
- the hosting layer is still operational

This is how the two layers connect into one control plane rather than existing as unrelated modules.
