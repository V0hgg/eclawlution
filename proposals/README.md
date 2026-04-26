# proposals/

Use this folder for ideas that are promising but not yet safe enough to auto-implement.

Current lightweight lifecycle states:
- `draft` - captured locally but not yet ready for review
- `proposed` - ready for maintainer or human review
- `approved` - accepted for implementation
- `implemented` - landed in the repo
- `rejected` - intentionally not moving forward
- `superseded` - replaced by a newer proposal

Today these states are observable metadata, not runtime enforcement.
They help daily review stay honest about what is still an idea versus what actually landed.

Examples:
- risky architecture shifts
- auth/secrets related changes
- anything that could affect live user workflows in surprising ways
- larger refactors that need a human check first
