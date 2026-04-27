# How to Use eclawlution

## What eclawlution is

`eclawlution` is not a magic one-click bot.
It is a system layer for making an OpenClaw companion improve over time.

It works through 3 main loops:
- **conversation digest** — learns tone, phrasing, and durable preferences
- **self-evolution** — improves the assistant and surrounding workflows
- **repo self-evolution** — improves the `eclawlution` repo itself

## What this repo actually provides today

This repo currently provides:
- workflow contracts and examples
- local helper commands for scorecards, proposals, manifests, and security posture checks
- reports and proposal patterns for the repo self-evolution loop

It does not currently auto-install cron jobs or register native OpenClaw runtime hooks for you.
If you want the daily loop timings below, wire them in your own OpenClaw workspace.

## If you are a user, how do you use it?

### Mode 1: Let the daily cron jobs run
This is the easiest mode.

This mode assumes you already wired those jobs yourself. The repo documents the pattern, but the current plugin scaffold does not register the jobs automatically.

Expected daily flow:
- **23:40** conversation digest updates style and memory fit
- **02:00** workspace self-evolution improves the assistant/workflows
- **03:30** repo self-evolution improves `eclawlution` itself
- **06:00** summary to chat reports what changed

In this mode, you mostly give feedback naturally in conversation.
The system learns from:
- your approvals
- your corrections
- what annoys you
- what kind of replies fit you better

### Mode 2: Run a manual cycle now
If you want to force a cycle immediately, do one of these:

#### From OpenClaw chat
Ask the assistant to:
- run the self-evolution cycle now
- run the conversation digest now
- run the repo self-evolution now

#### From the repo locally
Inside the repo:
```bash
npm test
npm run check
npm run manifest
npm run scorecard:example
npm run proposal:example
npm run security:safe-local-example
npm run security:example
npm run security:medium-risk-example
npm run security:non-prompt-example
```

These commands do not run the whole OpenClaw orchestration loop, but they let you inspect the building blocks.

`npm run security:safe-local-example` shows a benign auth/security-adjacent change request that should stay at `safe-local`.
`npm run security:medium-risk-example` shows a suspicious prompt that should stay at `medium-risk`.
`npm run security:example` shows a higher-severity prompt that should escalate to `approval-required`.

`npm run security:non-prompt-example` shows that suspicious override or secret-reveal text in non-prompt fields still gets classified and surfaced for review.

Benign auth or token-documentation text should not escalate by itself unless the request also asks to reveal sensitive material or sets sensitive change flags.

All four are quick sanity checks for how the current security helper classifies safe-local and risky prompts or change requests.

Important boundary:
- `node src/cli.js security ...` classifies a prompt or change request, scanning the main prompt plus other text-bearing fields like summaries and next actions
- the security output includes `approvalBoundary`, `handlingRecommendation`, and `blockerDetails` so review routing is easier to audit locally
- `node src/cli.js proposal ...` formats lifecycle state, review metadata, and rollback notes, and now preserves stricter risk floors when risky flags or a prior `securityPosture` are provided
- neither command enforces approval by itself
- if the output says `approval-required`, route it into a proposal or human review instead of forcing the change
- if a proposal is still pending review, keep its `status` honest (`draft` or `proposed`) instead of making it look implemented prematurely

### Mode 3: Review what changed
Check these places:
- workspace `MEMORY.md`
- workspace `DREAMS.md`
- workspace `memory/YYYY-MM-DD.md`
- repo `reports/`
- repo `proposals/`
- GitHub commit history for `eclawlution`

## How the repo self-evolution loop works

The repo loop should behave like this:

1. **Main agent orchestrates**
2. Spawn subagents early for parallel work
   - **reviewer subagent** — audits clarity, UX, architecture, and over-promising
   - **tester subagent** — runs tests/checks/examples and reports failures or weak spots
   - **researcher subagent** — finds better patterns for adaptive companion systems and workflow tuning
   - **security reviewer subagent** — hunts prompt injection risk, weak approval boundaries, secret-handling problems, and unsafe autonomy
3. Main agent synthesizes findings
4. Main agent makes safe additive improvements
5. Main agent reruns tests/checks
6. If safe, commit and push
7. If risky/unclear, write a proposal instead

## What eclawlution should improve automatically
- docs
- prompts
- workflow boundaries
- schedule timing
- reporting cadence
- memory rules
- style-fit profile
- tests/examples/templates

## What still needs approval
- risky restarts
- destructive changes
- new auth/secrets
- anything with surprising external side effects

Approval enforcement is still an operator and orchestrator responsibility today. The local CLI helps classify and document changes, but it does not act as a hard runtime gate.

## Short mental model

Think of `eclawlution` as:
- part memory system
- part workflow optimizer
- part companion-improvement loop
- part repo that can improve itself carefully over time
