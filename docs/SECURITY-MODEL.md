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

## What still needs approval
- new auth flows
- restart behavior that impacts live sessions
- destructive refactors
- automation that can affect external systems
