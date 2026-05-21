# CollabDoc Documentation

This folder is the single documentation home for the CollabDoc repository.

All Markdown documentation was consolidated here on May 19, 2026 from the repository root, `docs`, `backend`, `frontend`, and `templates` folders. Older documents remain for historical context, but the current source of truth is this index, `CURRENT-STATE.md`, and the sprint folders.

## Start Here

- `CURRENT-STATE.md` - current product and engineering reality based on screenshots, docs, code inspection, and live local API checks.
- `PROGRAM-STATUS.md` - global sprint and workflow progress dashboard.
- `GLOBAL-PROGRESS-MONITORING-AND-GUARDRAILS.md` - cross-sprint gates, guardrails, and definition of done.
- `UI-UX-REVIEW.md` - current UX critique and redesign direction.
- `EVIA-PRISM-DESIGN-ADAPTATION-ROADMAP.md` - comprehensive Stitch/Evia Prism review and technical-debt-prioritized design-adaptation sprints.
- `sprint 01- stabilization/README.md` - first repair sprint to make the current app coherent and testable.
- `sprint 02- template foundation/README.md` - managed reusable template and field-library sprint.
- `sprint 03- records lifecycle/README.md` - classification, retention, versioning, and finalization sprint.
- `sprint 04- real-time collaboration/README.md` - real-time co-editing architecture and implementation sprint.
- `sprint 05- production hardening/README.md` - auth, audit, storage, CI, deployment, and operational readiness sprint.

## Current Product Goal

CollabDoc is intended to be a collaboration tool where users can create reusable document templates, generate documents from managed merge fields, collaborate on document content, and manage every document through classification, retention, versioning, and finalization lifecycle controls.

## Current Reality

The repository is a working prototype with several valuable pieces in place, but it is not production-ready yet.

What is currently present:

- React frontend with Documents, Templates, Field Library, Template Editor, Generate-from-Template, Profile, Settings, and Document Editor routes.
- Evia Prism app shell with sidebar navigation, topbar actions, mobile bottom navigation, and a persistent Light/Dark appearance preference.
- Evia Prism first-pass Documents and Templates list/gallery surfaces using real API-backed data.
- Node/Express backend using local file storage under `backend/templates` and `backend/uploads`.
- Syncfusion Document Editor integrations, including isolated and direct editor variants.
- Basic document save/list/load/version behavior.
- Template list/load/generate behavior with managed field metadata enrichment and lifecycle policy preservation.
- JSON-backed managed field library with a first UI for listing, filtering, creating, and editing fields.
- Docker local setup using `docker-compose.local.yml` and the `collabdoc-local` network.

What is currently broken or incomplete:

- UI/UX is improved but still incomplete. The Evia Prism shell/list/account pass is done, while Field Library, modal workflows, generation, and editor chrome still need design-system coverage.
- Some stored seed templates are legacy/plain-text SFDT wrappers and need a proper authoring or migration path for high-fidelity Word-like formatting.
- Unknown template placeholders still need richer migration workflows and stronger validation enforcement.
- `/editor-test` remains a diagnostic route and should not be treated as production UI.
- Syncfusion editor chrome should be adapted carefully in a future pass without changing the known-working editor initialization and teardown pattern.
- Classification, document type, retention, and finalization are not enforced before save.
- Authentication, authorization, production storage, auditability, real-time collaboration, and final record immutability are not production-ready.

## Documentation Rules Going Forward

- New planning work should go into sprint folders.
- Product truth should be updated in `CURRENT-STATE.md` first.
- Global progress should be updated in `PROGRAM-STATUS.md`.
- Sprint work must satisfy `GLOBAL-PROGRESS-MONITORING-AND-GUARDRAILS.md` before being marked accepted.
- Historical Syncfusion/debugging notes should stay available but must not override current-state documentation.
- If implementation changes a workflow, update the matching sprint README and current-state doc in the same change.
- If implementation changes a user-facing surface or design direction, update `EVIA-PRISM-DESIGN-ADAPTATION-ROADMAP.md` and `UI-UX-REVIEW.md` as needed.