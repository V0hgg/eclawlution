# Repo Self-Evolution Workflow

This workflow is for `eclawlution` evolving **itself** as a repository.

## Goal
Improve the repo every day so it becomes more useful, more grounded, and more adaptive over time.

## Scope
The workflow may:
- review repo architecture, docs, scripts, templates, and examples
- audit whether the current roadmap still makes sense
- research better patterns for adaptive companion systems and workflow tuning
- implement safe additive improvements
- run local checks/tests
- commit and push safe improvements to `main`
- write proposals for risky or unclear changes instead of forcing them

## Daily loop
0. **Orchestrate**
   - main agent acts as orchestrator
   - spawn subagents early when useful so review, testing, and research can happen in parallel
   - default subagent roles:
     - **reviewer**: clarity, UX, docs, architecture, over-promising, user confusion
     - **tester**: tests, checks, examples, script sanity, breakage risk
     - **researcher**: better patterns from adaptive companion systems, workflow tuning, and agent design

1. **Review**
   - read `README.md`, `docs/`, `workflows/`, recent `reports/`, and recent `proposals/`
   - inspect open issues or obvious repo gaps when useful

2. **Audit**
   - identify weak spots: vague docs, missing tests, missing examples, weak boundaries, duplicated concepts, missing guardrails, stale roadmap items
   - score the repo on clarity, usefulness, safety, extensibility, and user-fit

3. **Research**
   - look for patterns from companion systems, memory systems, agent workflow design, cron orchestration, and adaptive prompt/runtime design
   - prefer findings that can improve `eclawlution` concretely

4. **Synthesize**
   - main agent combines reviewer, tester, and researcher findings
   - resolve contradictions before implementing changes

5. **Implement**
   - make safe additive changes to docs, scripts, examples, scorecards, proposals, templates, or tests
   - do not introduce secrets/auth changes
   - do not make destructive changes without explicit approval

6. **Evaluate**
   - run local checks/tests again after edits
   - confirm changes are coherent and reversible
   - if changes are risky or ambiguous, write a proposal instead of pushing directly

7. **Publish**
   - if safe and passing, commit with a concise message and push to `main`
   - if nothing worthwhile changed, do nothing

## Safe-to-push changes
- docs
- examples
- templates
- workflow contracts
- tests
- small utility scripts
- additive architecture clarifications

## Approval-required changes
- destructive refactors
- auth/secrets handling
- risky automation that could impact live systems
- behavior that would increase surprise cost materially

## Outputs
- `reports/YYYY-MM-DD.md`
- optionally `proposals/YYYY-MM-DD-*.md`
- git commits for safe completed improvements
- explicit notes about what each subagent found when subagents were used

## Commit style
- `docs(eclawlution): ...`
- `feat(eclawlution): ...`
- `chore(eclawlution): ...`
- `test(eclawlution): ...`

## Rule of thumb
Make the repo better every day, but never in a way that feels reckless or harder to trust.
