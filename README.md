# eclawlution

Adaptive self-evolution layer for OpenClaw companions.

## What it is

`eclawlution` is an attempt to turn an OpenClaw assistant into a companion that can:

- learn a user's durable preferences over time
- digest conversations and improve tone fit
- tune jobs, prompts, schedules, and workflow boundaries
- continuously research better ways to evolve
- improve the surrounding operating system, not just the chatbot itself

## Why this exists

OpenClaw already has strong primitives:

- sessions
- cron jobs
- memory search
- dreaming
- plugin hooks
- subagents

But there is not yet a single built-in layer that ties those into a recursive, Hermes-like self-improvement loop.

`eclawlution` aims to be that missing layer.

## Current scope

This repository starts with a **Phase 1 workflow package**:

- self-evolution protocol
- conversation digest protocol
- memory/style-fit conventions
- schedule and workflow tuning rules
- reporting + reflection templates

Then grows into **Phase 2 native OpenClaw extension hooks**.

## What is real today

Today this repo gives you:

- workflow contracts in `workflows/`
- local helper utilities in `src/` for manifests, scorecards, proposals, and security posture checks
- example prompts and wiring notes in `examples/`
- a descriptive `openclaw.plugin.json` scaffold that marks the repo as an optional extension surface, but does not register jobs or hooks by itself
- daily reports and proposal routing for repo self-evolution, including lightweight proposal lifecycle state metadata

Today this repo does **not** yet give you:

- automatic cron installation
- transcript digestion hooks
- memory or style-fit mutation code
- runtime enforcement of `approvalBoundary`
- native OpenClaw hook registration beyond a minimal manifest scaffold

Important clarification:
- `openclaw.plugin.json` is currently descriptive metadata only
- it does not auto-install cron jobs
- it does not register native runtime hooks yet
- manual workspace wiring is still the real way to use the loops in this repo today

## Design goals

1. Improve memory quality, not just memory quantity.
2. Adapt to the user without becoming creepy or deceptive.
3. Optimize the whole operating loop: jobs, cadence, prompts, reports, and behavior.
4. Prefer safe additive improvement over reckless autonomy.
5. Make evolution observable through reports, diffs, and durable notes.

## Core loops

### 1. Conversation digest
Reviews daily conversations, extracts stable preferences, tone cues, pacing cues, correction patterns, and assistant tone misses.

### 2. Self-evolution
Researches better companion patterns, evaluates what fits the current system, applies safe improvements, and reflects.

### 3. Workflow tuning
Adjusts cron schedules, prompt scopes, summaries, and maintenance routines when that clearly improves fit for the user.

### 4. Memory maintenance
Keeps long-term memory compact, deduplicated, and retrieval-friendly.

### 5. Repo self-evolution
Lets `eclawlution` review, audit, research, improve, test, commit, and push improvements to itself on a daily loop, while routing risky ideas into proposals instead of forcing them.

### 6. Security hardening
Makes `eclawlution` improve prompt-injection resistance, approval boundaries, restart safety, and secret-handling posture over time.

## Planned extension capabilities

- transcript-aware digest hooks
- style-fit profile management
- workflow scorecards
- job usefulness scoring
- safe schedule tuning
- proposal/draft PR generation for larger changes
- human approval boundaries for risky changes

## What phase 2 adds

This scaffold now includes:

- a small scorecard engine (`src/scorecard.js`)
- a change-proposal builder with lifecycle state, risk, rollback, approval metadata, and stricter risk-floor clamping for obviously risky proposals (`src/proposal.js`)
- a security posture helper with severity-tagged prompt-injection signal matching across prompt and other text-bearing change-request fields, structured blocker details, and approval-boundary output (`src/security.js`)
- a CLI (`src/cli.js`)
- self-tests (`src/self-test.js`)
- CI workflow examples
- issue templates for workflow tuning and feature requests
- docs for the native plugin contract and operating model
- a repo self-evolution workflow with subagent-oriented orchestration
- prompt-injection and security posture helpers (`src/security.js`)

## How to use it

Read `docs/USAGE.md` first.

If you are a user, the short version is:
- wire the suggested cron loops in your OpenClaw workspace and let them run daily, or
- manually ask OpenClaw to run one of the loops now, or
- inspect reports/proposals/Git history to see what changed, or
- run the local example commands in `docs/USAGE.md`, including safe-local, medium-risk, guardrail-disable, secret-exfiltration, restart-without-approval, approval-required, non-prompt injection, and rollback-injection security examples

For the manual setup path, start with:
- `docs/USAGE.md`
- `examples/openclaw-wiring.md`
- `examples/manual-openclaw-prompts.md`

## Repository structure

- `src/` — initial extension scaffold and protocol registry
- `docs/` — architecture, roadmap, safety model
- `workflows/` — markdown workflow contracts
- `reports/` — daily self-evolution reports for the repo itself
- `proposals/` — risky or not-yet-approved ideas
- `examples/` — example OpenClaw wiring/config snippets

## Status

Early scaffold. The operating ideas are already being used in a live OpenClaw workspace, but this repo currently exposes helper utilities and workflow contracts, not full runtime hooks.

## Safety model

`eclawlution` should be broad in authority for:

- memory rules
- workflow prompts
- cron schedules
- digest/report cadence
- local operating docs

But still require approval for:

- risky restarts
- destructive edits
- new secrets/auth
- external side effects

## Roadmap

See `docs/ARCHITECTURE.md`, `docs/PLUGIN-CONTRACT.md`, `docs/OPERATING-MODEL.md`, `docs/ROADMAP.md`, and `workflows/REPO-SELF-EVOLUTION.md`.
