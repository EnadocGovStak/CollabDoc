# Sprint 03- Records Lifecycle

## Goal

Make classification, retention, versioning, and finalization real lifecycle controls instead of optional UI fields.

## Required Policy

The user decision for this plan is: classification is required before save.

This sprint should require the following before a document can be saved:

- Classification.
- Document type.
- Retention period or retention rule.

## Scope

1. Define records metadata schema.
2. Add backend validation for required records fields on save.
3. Remove heuristic classification assignment from list rendering.
4. Store lifecycle metadata in document metadata consistently.
5. Add status transitions: Draft, In Review, Approved, Final, Archived, Expired.
6. Make final documents read-only server-side and client-side.
7. Add version comments and meaningful version metadata.
8. Add retention expiry calculation from policy.
9. Redesign records UI so classification, document type, retention, and finalization read as mandatory lifecycle controls.
10. Add tests for save rejection, finalization, versioning, and expiry display.

## Acceptance Criteria

- A document cannot be saved without classification, document type, and retention.
- List cards display stored lifecycle metadata only.
- Final documents cannot be edited through the UI or API.
- Version history identifies version number, timestamp, and reason/comment.
- Expiry dates are deterministic and based on stored retention policy.
- Records metadata survives document edits and version restores.
- UX clearly explains why save is blocked when lifecycle fields are missing.
- `PROGRAM-STATUS.md` reflects lifecycle workflow health after validation.

## Out Of Scope

- External records system integration.
- Legal hold workflows.
- Digital signing integration.