# eclawlution Roadmap

This roadmap is directional, not a perfect changelog.
To keep the repo honest, the sections below separate what is already shipped in the repo today from what is still planned.

## Shipped in the repo today
- repository scaffold
- self-evolution protocol
- conversation digest protocol
- architecture and operating-model docs
- GitHub publish
- workflow scorecard engine
- CLI for manifest, scorecard, proposal, and security posture inspection
- security posture classification helper
- CI workflow and issue templates
- repo self-evolution reports and proposal routing artifacts
- lightweight proposal lifecycle state metadata

## Still planned or only partially implemented
- usefulness scoring for individual cron jobs
- schedule recommendation logic
- style-fit diff tracking
- transcript digestion hooks
- structured recommendation objects beyond local helper output
- a real runtime integration surface that bridges docs/workflows into native OpenClaw hooks
- hard runtime approval enforcement instead of classification plus review metadata only
- draft PR generation for larger changes
- safer config mutation planning
- approval-aware restart planning
- deeper adaptation loops
- cross-workflow optimization
- better user-fit evaluation metrics

## Near-term priorities
- keep shipped versus planned capability brutally clear in docs and examples
- strengthen proposal observability and approval-boundary documentation
- expand adversarial prompt-injection tests and examples before attempting heavier enforcement claims
- add safe, local-only workflow tuning helpers that remain easy to audit and revert
