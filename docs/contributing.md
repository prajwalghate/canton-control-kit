# Contributing

## Principles

- keep primitives modular and package-ready
- prefer explicit authorization checks in every public choice
- document privacy implications in code comments
- add DamlScript coverage for both happy paths and negative paths
- avoid prematurely coupling the primitives to a specific application or token model

## Development Flow

1. Update the relevant DAML module.
2. Add or extend a DamlScript test.
3. Build with `dpm build`.
4. Run the affected scripts with `dpm test` or `dpm script --ide-ledger`.

## Scope Discipline

This repository is infrastructure-first. Please keep the MVP focused on reusable primitives rather than UI or app-specific workflows.
