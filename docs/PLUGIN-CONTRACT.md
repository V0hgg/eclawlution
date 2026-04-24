# Native Plugin Contract (Phase 2)

## Goal
Turn eclawlution from a workflow package into a real OpenClaw-native extension.

## Target responsibilities
- register evolution-related hooks
- provide structured scorecards for jobs/workflows
- provide proposal objects for schedule/prompt tuning
- expose safe helper utilities for digest, reflection, workflow changes, and repo self-evolution reporting

## Non-goals
- silent destructive autonomy
- hidden profiling
- secret management without approval
- restarting live systems without explicit consent

## Candidate hook surfaces
- session transcript digestion
- memory promotion helpers
- cron/job evaluation
- schedule recommendation generation
- style-fit profile updates
- self-evolution report generation

## Required guardrails
- explicit risk classes on all recommendations
- clear rollback notes
- approval boundary metadata
- prompt-injection resistance checks for risky instruction flows, with structured blocker details for operator review
- human-readable summaries for every autonomous change

## Structured proposal object

Change proposals should carry enough metadata to be reviewed or auto-routed safely.

```json
{
  "title": "Shift self-evolution summary later",
  "summary": "Move the daily summary to a time when the user is more likely to be awake.",
  "humanSummary": "Proposal to move the daily self-evolution summary later in the morning.",
  "scope": ["cron", "reporting-cadence"],
  "rationale": ["Current timing may be too early for useful review."],
  "risks": ["Summary may overlap with other morning workflows."],
  "riskClass": "medium-risk",
  "approvalRequired": false,
  "approvalBoundary": "maintainer-review",
  "rollbackPlan": ["restore the previous cron schedule"],
  "validationChecks": ["compare user engagement for 3 days"],
  "nextActions": ["adjust summary cron"]
}
```

### Risk classes
- `safe-local` - additive local changes that are easy to revert
- `medium-risk` - changes that deserve maintainer review before broad rollout
- `approval-required` - changes that must not auto-apply without explicit human approval

### Approval boundaries
- `auto-implementable` - safe to apply locally when checks pass
- `maintainer-review` - safe to draft, but should be reviewed before rollout
- `explicit-human-approval` - blocked until a human explicitly approves it
