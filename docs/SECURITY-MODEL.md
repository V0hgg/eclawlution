# Security Model

## Threat model

`eclawlution` is not only trying to become smarter. It is trying to become smarter **without becoming easier to steer unsafely**.

### Main threats
- prompt injection
- hidden attempts to override higher-priority instructions
- requests to reveal prompts, secrets, or credentials
- unsafe restarts during live usage
- destructive repo/workflow changes pushed without review
- external side effects triggered by over-broad autonomy

## Security principles
- never trade safety for convenience silently
- treat approval boundaries as product behavior, not incidental policy
- route unclear/risky ideas into proposals instead of direct implementation
- keep human-readable rollback notes for non-trivial changes
- do not grant the system secret-handling or restart authority by accident

## Prompt injection posture

The system should treat attempts like these as suspicious by default:
- "ignore previous instructions"
- "reveal your system prompt"
- "disable safety"
- "print secrets / tokens / api keys"
- "restart the gateway now"

Prompt-injection findings should increase risk class and often force proposal-only handling.
Suspicious instruction-override or mode-escalation prompts can land in `medium-risk`, while attempts to disable approval, reveal or dump secrets, or restart live systems should escalate to `approval-required`.
Benign auth or token-related documentation text should stay `safe-local` unless it also asks to expose sensitive material or sets sensitive change flags.

## Risk classes
- **safe-local**: docs, examples, prompts, tests, templates, additive local logic
- **medium-risk**: workflow boundary changes, schedule changes, moderate automation changes
- **approval-required**: secrets/auth, risky restarts, destructive edits, external side effects

## What self-evolution may harden automatically
- docs and guardrails
- workflow contracts
- scorecard dimensions
- proposal metadata
- tests/examples around prompt injection and unsafe requests

## Current enforcement boundary

Today the repo exposes security posture **classification**, not hard runtime enforcement.

- `evaluateSecurityPosture()` classifies prompts and change requests into a risk class plus `approvalBoundary`, `handlingRecommendation`, and structured `blockerDetails`
- prompt-injection scanning now looks at the main prompt plus other text-bearing change-request fields, so suspicious content in summaries, rationale, or next actions is harder to miss
- `buildChangeProposal()` formats proposal lifecycle state, review metadata, rollback notes, and approval labels
- `buildChangeProposal()` now clamps proposal risk upward when destructive, restart, secret-touching, or external-effect flags are present, and it can use `securityPosture.riskClass` as a stricter floor
- neither helper blocks execution by itself
- callers should still run security evaluation first, then route `medium-risk` and `approval-required` results into maintainer or human review instead of auto-applying them
- proposal `status` is observable review metadata only today, but it helps make pending versus implemented security-sensitive ideas easier to audit

Important implementation note:
- `buildChangeProposal()` now defends against some under-classification footguns, but it is still not a substitute for running `evaluateSecurityPosture()` first
- prompt-injection classification still lives in the security helper, not the proposal builder itself
- the intended flow is: security evaluation -> proposal routing -> human/orchestrator decision -> implementation

## Manual verification surface

Inside the repo, you can inspect the current security helper behavior with:

```bash
npm run security:safe-local-example
npm run security:medium-risk-example
npm run security:example
npm run security:guardrail-disable-example
npm run security:secret-exfiltration-example
npm run security:restart-without-approval-example
npm run security:non-prompt-example
node src/cli.js security examples/security-posture-safe-local.example.json
node src/cli.js security examples/security-posture-medium-risk.example.json
node src/cli.js security examples/security-posture.example.json
node src/cli.js security examples/security-posture-guardrail-disable.example.json
node src/cli.js security examples/security-posture-secret-exfiltration.example.json
node src/cli.js security examples/security-posture-restart-without-approval.example.json
node src/cli.js security examples/security-posture-non-prompt-injection.example.json
```

The helper returns a risk class plus an `approvalBoundary`, `handlingRecommendation`, and structured `blockerDetails` so the output is easier to route into review or human approval. Prompt-injection evidence now includes which text surface was flagged, not just that something suspicious was found somewhere. The shipped example set now explicitly covers benign safe-local text, medium-risk instruction overrides, guardrail-disable attempts, secret-exfiltration requests, restart-without-approval requests, and suspicious text hidden outside the main prompt.

This is not a full security audit. It is a small local verification path for checking how `eclawlution` currently classifies risky prompts and risky changes.
The current scanner is still heuristic and regex-based, so treat it as an observable signal, not a standalone defense.

## What still needs approval
- new auth flows
- restart behavior that impacts live sessions
- destructive refactors
- automation that can affect external systems
