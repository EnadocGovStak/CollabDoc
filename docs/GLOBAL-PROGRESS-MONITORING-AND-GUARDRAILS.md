# Global Progress Monitoring And Guardrails

Last updated: May 19, 2026.

This document defines the control layer above the sprint folders. No sprint should be treated as complete just because code was written. Each sprint must pass product, engineering, UX, records, and documentation guardrails.

## Why This Exists

CollabDoc currently has working pieces, but the pieces are not governed as one product. The result is visible in the screenshots: broken template loading, raw JSON previews, unstable editor test routes, inconsistent metadata behavior, and UI that feels assembled rather than designed.

The global guardrails prevent that from continuing.

## Program Status Model

Use this status model in every sprint README and in `PROGRAM-STATUS.md`.

| Status | Meaning |
| --- | --- |
| Not Started | No implementation work has begun. |
| Discovery | Requirements, design, or technical approach is being validated. |
| In Progress | Implementation has started but is not acceptance-ready. |
| Blocked | Work cannot continue without a decision, dependency, or fix. |
| In Validation | Code exists and is being tested against acceptance criteria. |
| Accepted | Product, UX, engineering, tests, and docs all pass. |

## Global Progress Signals

Track these across the whole program, not only per sprint:

- Critical workflow health: Documents, Templates, Template Editor, Generate from Template, Document Editor, Save, Version History.
- API contract health: route ordering, response schemas, error states, auth expectations.
- UX health: navigation clarity, editor layout stability, template workflow clarity, records lifecycle visibility.
- Records health: classification, document type, retention, finalization, audit readiness.
- Test health: frontend unit tests, backend endpoint tests, Playwright smoke tests, Docker smoke checks.
- Documentation health: `CURRENT-STATE.md`, sprint READMEs, API docs, and testing docs match reality.

## Sprint Entry Gate

Before a sprint starts, it must have:

- A clear problem statement.
- User-visible acceptance criteria.
- Engineering acceptance criteria.
- UX acceptance criteria.
- Records/lifecycle acceptance criteria when documents or templates are touched.
- Test plan.
- Known risks.
- Explicit out-of-scope items.

## Sprint Exit Gate

A sprint is accepted only when:

- All acceptance criteria pass.
- Critical workflows are smoke-tested locally.
- No new uncaught browser runtime errors exist in target workflows.
- No raw JSON/SFDT is visible to normal users unless in an explicit developer debug view.
- Docs are updated in the same change.
- UI changes pass a basic responsive check.
- API route changes include route-order checks when dynamic routes exist.
- Records lifecycle rules are enforced server-side if the sprint touches document save/finalization.

## Product Guardrails

- A user-facing workflow must never depend on a missing service method.
- Static API routes must be registered before dynamic `/:id` routes.
- Template fields must come from the managed field library after Sprint 02. Auto-extraction is migration support only.
- Classification, document type, and retention are required before document save after Sprint 03.
- Final documents must be immutable through both UI and backend API.
- Editor diagnostics must not appear as production navigation.
- Preview means rendered document preview, not raw serialized editor content.
- Empty states must explain what action is available next.

## Engineering Guardrails

- Maintain one active frontend service layer per domain. Avoid duplicate JS/TS clients with divergent contracts.
- Every backend route group with dynamic IDs must have tests proving static routes are reachable.
- No heuristic classification assignment in presentation components.
- File storage behavior must be deterministic until production storage is chosen.
- New API behavior must be reflected in `api-spec.md` or explicitly marked as temporary.
- Docker local flow must continue to start backend and frontend on the `collabdoc-local` network.

## UX Guardrails

- The app should feel like a work-focused document operations tool, not a demo gallery.
- Primary workflows should start from the working surface, not from explanatory pages.
- Document and template cards should present real metadata with clear actions.
- Modals must have one clear primary action and meaningful disabled states.
- Editor pages must avoid nested scroll traps and unstable side panes.
- Icons must be consistent and recognizable; avoid emoji as primary production UI controls.
- No user-facing page should show implementation details such as SFDT, stack traces, or raw JSON.

## Definition Of Done

For every sprint item:

- Works locally in Docker or the documented local dev environment.
- Has tests appropriate to the risk.
- Has no known critical runtime errors.
- Meets UX acceptance criteria.
- Meets records/lifecycle requirements if applicable.
- Has documentation updated.
- Has a rollback or mitigation path for risky changes.

## Required Review Checklist

Use this checklist before marking sprint work Accepted:

- Product owner review.
- UX review.
- Engineering review.
- Records/lifecycle review.
- Test evidence review.
- Documentation review.

If one review fails, the sprint item remains In Validation or Blocked.