# eclawlution Architecture

## Thesis

A companion does not become adaptive from memory alone.
It becomes adaptive when memory, schedule, reporting, workflow boundaries, and style fit are all allowed to co-evolve.

## Layers

### Layer 1 — Durable memory
- long-lived user preferences
- communication rules
- recurring workflow expectations

### Layer 2 — Episodic memory
- daily notes
- transcript-derived signals
- recent corrections

### Layer 3 — Style-fit profile
- cadence
- wording preference
- tone guardrails
- patterns to avoid

### Layer 4 — Evolution loop
- research
- evaluate
- implement
- reflect

### Layer 5 — Workflow tuning
- job usefulness scoring
- schedule fit
- prompt scope tuning
- report cadence tuning

## Phase plan

### Phase 1
Workflow package living in the workspace:
- markdown protocols
- cron jobs
- digest loops
- scorecards
- human-readable reports

### Phase 2
Native extension hooks:
- transcript capture helpers
- score generation
- safe recommendation engine
- config diff proposal engine

### Phase 3
Proposal + patch engine:
- generate draft PRs for larger changes
- maintain changelog of self-improvements
- learn per-user operating preferences over time

## Safety constraints

Broad authority is acceptable for:
- docs
- prompts
- schedules
- local workflow shape
- memory rules

Approval required for:
- secrets/auth
- external side effects
- destructive changes
- risky restarts during active chats
