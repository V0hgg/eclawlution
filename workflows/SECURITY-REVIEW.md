# Security Review Workflow

Goal: make `eclawlution` improve its security posture over time, especially against prompt injection, unsafe autonomy, secret leakage, and risky workflow changes.

## Review areas
- prompt injection resistance
- over-broad autonomy
- secret/auth handling boundaries
- live restart safety
- external side effect boundaries
- repo claims vs actual guardrails
- whether risky changes are routed into proposals instead of direct implementation

## Security reviewer output
Each review should produce:
- prompt injection risks found
- unsafe workflow patterns found
- missing approval boundaries
- unclear or weak rollback guidance
- recommended hardening changes
- whether the repo is over-promising security it does not yet implement

## Guardrails
- Prefer additive hardening
- Do not weaken approval boundaries automatically
- Treat prompt-injection resistance as an explicit evaluation category, not an afterthought
