# Contributing

## Principles

- keep primitives modular and package-ready
- prefer explicit authorization checks in every public choice
- document privacy implications in code comments
- keep hosting governance and execution governance conceptually separate even when they integrate tightly
- add DamlScript coverage for both happy paths and negative paths
- avoid coupling the primitives to one app, token, or operator environment too early

## Development Flow

1. update the relevant DAML module
2. add or extend a DamlScript test
3. build with `dpm build`
4. run the affected scripts with `dpm test`
5. update docs when authorization, privacy, or hosting assumptions changed

## Scope Discipline

This repository is infrastructure-first.

Prefer contributions that improve:

- hosting governance
- proposal and approval discipline
- auditability
- replay protection
- extensibility

Be cautious about contributions that jump too quickly into:

- UI
- product-specific flows
- hard-coded asset logic
- one-off operator assumptions
