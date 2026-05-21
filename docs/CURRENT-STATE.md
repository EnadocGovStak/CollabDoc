# Current State

Last updated: May 21, 2026.

This document reflects the current repo behavior observed from the attached screenshots, existing documentation, source inspection, and live local Docker API checks.

## Intended Product

CollabDoc should allow users to:

- Create reusable document templates.
- Manage template merge fields through a governed field library.
- Generate documents from templates using validated data capture forms.
- Classify documents before saving.
- Apply retention and lifecycle rules from the first saved version.
- Collaborate in real time on document content.
- Finalize documents into read-only records with version history and auditability.

## Verified Local Environment

The local Docker setup exists and has been verified:

- Compose file: `docker-compose.local.yml`
- Docker network: `collabdoc-local`
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- Health endpoint: `http://localhost:5000/health`

## What Works Today

- Backend health returns `UP` locally.
- Frontend serves from the local Docker container.
- Documents page can list existing locally stored documents.
- Templates page can list templates from `backend/templates`.
- Templates page includes a Guided creation panel and Start from Blank card that route users into template authoring.
- Template categories and search endpoints respond successfully.
- Blank document creation can open the document editor.
- Document editor can save content and metadata through the local file-based backend.
- Basic version files are created for document saves.
- Template field extraction can find placeholders in template content for some templates.
- A JSON-backed managed field library now seeds reusable fields for Organization, Client, Invoice, Payment, HR, Legal, and System data.
- Template detail, list, search, and field-analysis APIs can enrich placeholders with managed labels, categories, descriptions, defaults, options, and migration status.
- A first Field Library UI at `/field-library` can list, filter, create, and edit managed fields.
- The Template Editor sidebar shows managed/unmanaged field analysis with Insert and Copy controls for detected template fields.
- The Template Editor sidebar can review unmanaged detected field metadata and promote the field into the Field Library from the Field Analysis panel.
- The Template Editor sidebar shows save-readiness notes for default names, incomplete lifecycle policy, unmanaged fields, and weak field metadata before save.
- Template Editor governed saves are blocked while readiness notes remain, with an explicit Save draft path for work in progress.
- Template create/update APIs reject incomplete governed saves with readiness details and only persist incomplete templates when the caller explicitly uses draft mode.
- The `/templates/new` authoring route now shows a Guided creation banner and checklist around the stable editor surface.
- Template create/update saves now refresh persisted `mergeFields` metadata from the current placeholders, including unmanaged-field migration flags.
- Generate from Template now renders a first guided Prism workflow for the invoice template, including summary cards, document-name validation, readiness checklist, lifecycle policy review, managed field metadata, grouped business categories, managed/unmanaged status badges, migration prompt, and tokenized preview chrome.
- The app shell now uses the Evia Prism design direction with persistent side navigation, topbar search/action controls, active route state, and mobile bottom navigation.
- Documents and Templates list pages now use tokenized Evia Prism cards, document-preview surfaces, calmer filters, explicit primary actions, and responsive layouts.
- Profile and Settings now use the same account surface system instead of bare placeholders. Both expose a persistent Light/Dark appearance selector, and the topbar includes a quick theme toggle.
- Legacy template generation can create and reload optimized SFDT content without converting it into raw text.
- Local frontend production build passes after dependencies are refreshed with `npm ci`.
- Local frontend production build now compiles without ESLint warnings; remaining build notes are dependency-age/deprecation and bundle-size guidance.
- The available frontend integration test suite passes and now covers the active axios-based document service.
- Manual browser smoke passes for Documents, Create Document modal, Templates, legacy invoice generation, and generated-document editor load.
- Automated Playwright browser smoke passes with `npm run smoke:browser` against the local Docker stack, including generation-to-editor, existing-template editor load, optimized and legacy template preview rendering, generation UI text cleanup, editor lifecycle metadata, and editor route-change checks.

## Recently Stabilized In Sprint 01

- `GET /api/templates/categories` and `GET /api/templates/search` are no longer shadowed by `GET /api/templates/:id`.
- `GET /api/documents/templates` is no longer shadowed by `GET /api/documents/:id`.
- Legacy template list/search results now expose a filename-derived `id` when stored template JSON has no embedded ID.
- Create New Document now uses the active template service and routes users to the canonical template generation page.
- Template merge forms now fall back to extracting placeholders from template content when `mergeFields` metadata is missing.
- The legacy invoice generation page now renders extracted fields such as `CompanyName`, `ClientName`, `InvoiceNumber`, `InvoiceDate`, `DueDate`, `ServiceDescription`, and `Amount`.
- Template preview and generation paths preserve structured SFDT JSON instead of wrapping it as raw text.
- Generated documents now include `title`, modified timestamps, initial version history, and inherited records metadata.
- The known-crashing `/editor-test` diagnostic route is hidden from primary navigation.
- Documents and Templates list cards now use quieter white surfaces with narrow lifecycle/category accents instead of strong full-card color fills.
- Documents now have search, status filtering, result count, explicit Open actions, and sorting that keeps placeholder `Untitled` records below named documents.
- Templates now have quieter search/category filters, no emoji-led filter/status labels, scoped preview CSS that no longer leaks grey description blocks into cards, and a clearer Generate-first action hierarchy.
- The Create New Document modal resets to Blank Document each time it opens, preventing stale template selections from persisting across modal sessions.
- Document editor lifecycle metadata now uses the same records-management fallback normalization as the Documents list, so classification and retention fields do not appear blank when only legacy metadata exists.
- The active document editor wrapper now keeps Syncfusion event callbacks stable across rerenders and destroys the editor/container on unmount, preventing the reproduced route-change crash when leaving an editor page.
- Template generation fallback fields no longer expose internal Sprint 02 planning text, and preview mode controls now use plain labels.
- Template preview modal layout no longer inherits the old card-level `.template-preview` styles, so Syncfusion renders across the modal instead of being clipped into a narrow column.
- Legacy plain-text template wrappers now get a styled SFDT fallback for preview, template editing, and generated documents. Real structured SFDT is still preserved without rewriting.
- Mechanical frontend warning noise was removed from active list, service, template preview, and editor wrapper code.

## Recently Applied Design Work

- Evia Prism light tokens were added to `frontend/src/styles/design-system.css` and are now the default workspace theme.
- A dark Evia Prism variant was added as an optional user preference. The selected theme is stored in `localStorage` as `collabdoc.theme` and applied through the document-level `data-theme` attribute.
- The shared React shell in `frontend/src/App.js` now wraps the app in a theme provider and exposes a topbar Light/Dark toggle.
- `Profile` and `Settings` now contain account/preference panels, including an appearance selector in both places.
- `Documents` and `Templates` received the first Evia Prism list/gallery pass. They are visually aligned but still use their existing services, modals, and editor navigation behavior.
- `Templates` now also restores the visible Guided creation entry point from the Stitch direction, including a Start from Blank card linked to template authoring.
- `Template Editor` now has a first guided creation layer for new templates without changing the underlying Syncfusion editor wiring.
- `Generate from Template` received the first D4 guided workflow pass. It still uses the existing template service and merge engine, but now separates load errors from generation errors and keeps validation inline instead of replacing the whole page.
- Syncfusion editor internals were intentionally left untouched during this design pass. The editor remains a separate, high-risk surface for a later controlled chrome update.

## What Is Broken Today

### UI/UX Coherence

The UI now has a first Evia Prism application pass, but it is not yet complete across the intended production product:

- The shell, Documents, Templates, Profile, and Settings are visually aligned around Evia Prism tokens.
- Editor-adjacent flows, modals, Template Editor side panels, and the Syncfusion editor chrome still need careful design adaptation.
- Raw implementation details such as SFDT/JSON are no longer visible in the smoke-tested flows, but broader template-by-template coverage is still needed.
- Records lifecycle controls are visible but do not yet feel like required policy steps.
- Template generation now has a first guided pass, and Template Editor has a first backend-backed migration review action plus UI/API governed-save readiness enforcement. Richer field validation rules are still pending.

The detailed UX critique lives in `UI-UX-REVIEW.md`. The comprehensive Stitch/Evia Prism review and design-adaptation sprint plan live in `EVIA-PRISM-DESIGN-ADAPTATION-ROADMAP.md`.

### Template Merge Fields

Some templates contain placeholders but do not have managed `mergeFields` metadata. Example: `backend/templates/a2e8ed36-0112-4d3c-b698-131b76d49c91.json` includes invoice placeholders such as `{{CompanyName}}` and `{{ClientName}}`, but lacks a `mergeFields` array.

Sprint 01 added a fallback that extracts placeholders for generation. Sprint 02 now adds the first managed reusable field-library bridge: extracted placeholders are analyzed against `backend/src/data/field-library.json`, known fields are enriched with governed metadata, and unknown fields are reported as migration-required. The first Field Library UI, Template Editor analysis panel, direct Insert controls, Add to Field Library review action for unmanaged fields, UI/API governed-save readiness enforcement, and save-time metadata write-back exist. Richer field validation rules are still pending.

### Preview And Rendering

Preview and generation paths now preserve recognized structured SFDT. The template preview modal now renders the full editor canvas instead of clipping the document into a narrow center column. Browser smoke verifies both optimized stored SFDT and legacy plain-text templates render as document previews without raw SFDT/JSON leaks.

There is still a real content-quality limit: several seed templates were stored as plain text inside an `sfdt` wrapper, not as richly authored SFDT. Sprint 01 applies a conservative styled fallback for those templates, but true Word-like formatting requires migration or re-authoring through a real template authoring/upload flow.

### Template Editor

The existing invoice template editor route now loads template metadata, clears the loading overlay, and renders the editor surface in browser smoke. The Professional Invoice template editor route was also checked directly after normalizing legacy `sfdt` wrapper content before direct editor loading. Deeper content fidelity, editing, save behavior, and multi-template authoring still need broader validation before template authoring is trustworthy.

### Editor Stability

Older docs claim the editor was stabilized, but `/editor-test` currently shows a runtime error:

`Cannot read properties of undefined (reading 'isSelectionCompleted')`

This route should be treated as a development diagnostic surface, not a production user route. Sprint 01 hides it from the main navigation, but the diagnostic itself is not fixed.

The active `/editor/:id` user route has been separately stabilized for the reproduced route-change failure. A fresh browser repro opened an existing document, confirmed records fields were populated, navigated away to Templates, and reported no page errors.

### Records Lifecycle

Classification, document type, retention period, and finalization are visible in the UI, but they are not enforced as production lifecycle controls. Some list cards apply default or heuristic classifications based on document names. That is not acceptable for records management.

## Production Readiness Gap

Production-ready means the following are enforced server-side, tested, and documented:

- Authentication and authorization.
- Classification before save.
- Retention before save.
- Managed template field library UI and enforcement. The first JSON/API-backed field-library slice, editor-side unmanaged-field promotion action, and UI/API governed-save enforcement exist, but richer field validation rules are not complete.
- Template-to-document generation with valid SFDT rendering.
- Real-time collaboration with conflict handling.
- Version history and audit events.
- Final document immutability.
- CI tests for critical workflows.
- Production storage architecture.
- Full design-system coverage for Field Library, modal workflows, and the Syncfusion editor frame.

The sprint folders describe the path from the current prototype to that target.

Global progress and guardrails are tracked in `PROGRAM-STATUS.md` and `GLOBAL-PROGRESS-MONITORING-AND-GUARDRAILS.md`.