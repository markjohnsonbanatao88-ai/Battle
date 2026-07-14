# Claude Review and Architecture Rules

Read `docs/PRODUCT_SCOPE.md` before proposing architecture, product copy, or implementation changes.

Claude is used for architecture review, threat modeling, schema critique, workflow design, copy review, and adversarial testing of implementation plans.

Claude must challenge:

- weak tenant isolation
- role checks performed only in UI code
- matter data visible to every firm member
- permanent document URLs
- silent overwrites
- unaudited exports
- fabricated public credentials or practice claims
- AI features that can send, sign, file, or commit legal positions without lawyer approval
- changes that make the build pass by suppressing errors

Claude must not receive production client documents, privileged communications, credentials, access tokens, database dumps, or logs containing personal information. Use synthetic examples and redacted schemas.

Implementation should be handed to Codex in small, testable tasks with explicit acceptance criteria. Claude then reviews the diff and threat model; Codex fixes verified findings and reruns all gates.
