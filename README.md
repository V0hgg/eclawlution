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
- a change-proposal builder (`src/proposal.js`)
- a CLI (`src/cli.js`)
- self-tests (`src/self-test.js`)
- CI workflow examples
- issue templates for workflow tuning and feature requests
- docs for the native plugin contract and operating model

## Repository structure

- `src/` — initial extension scaffold and protocol registry
- `docs/` — architecture, roadmap, safety model
- `workflows/` — markdown workflow contracts
- `examples/` — example OpenClaw wiring/config snippets

## Status

Early scaffold, but the operating ideas are already being used in a live OpenClaw workspace.

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

See `docs/ARCHITECTURE.md`, `docs/PLUGIN-CONTRACT.md`, `docs/OPERATING-MODEL.md`, and `docs/ROADMAP.md`.
