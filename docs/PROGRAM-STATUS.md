# Program Status

Last updated: May 21, 2026.

This is the global progress dashboard for the CollabDoc repair and production-readiness plan.

## Overall Status

Status: Sprint 02 in progress

Reason: Sprint 01 stabilization is an exit candidate, Sprint 02 has moved into visible template governance, and the first Evia Prism design-system pass is now applied to the app shell, Documents, Templates, Field Library, Generate from Template, Profile, and Settings. Templates resolve against a JSON-backed field library, generation forms consume managed metadata through a guided workflow, the backend reports unknown placeholders for migration, users can manage fields through the first Field Library UI, Template Editor can review/promote unmanaged placeholders into the Field Library, governed saves are blocked until readiness notes are resolved or explicitly saved as drafts, and template saves persist refreshed field metadata.

## Sprint Dashboard

| Sprint | Status | Primary Outcome | Current Risk |
| --- | --- | --- | --- |
| Sprint 01- Stabilization | Exit Candidate | Broken routes, services, previews, editor navigation/lifecycle, browser smoke, warning noise, and first-pass UX cleanup fixed | Template authoring fidelity and records enforcement remain for later sprints. |
| Sprint 02- Template Foundation | In Progress | Managed reusable template fields, reliable guided generation, field migration review, governed-save readiness enforcement, and first Evia Prism shell/list/account rollout | Server-side validation enforcement, richer field validation rules, Template Editor authoring polish, and editor-safe chrome polish are still pending. |
| Sprint 03- Records Lifecycle | Not Started | Classification and retention enforced before save | Current UI defaults/heuristics are not records-safe. |
| Sprint 04- Real-Time Collaboration | Not Started | Multi-user editing path proven and implemented | Syncfusion/SFDT collaboration model needs spike. |
| Sprint 05- Production Hardening | Not Started | Auth, audit, storage, CI, deployment readiness | Local file storage and disabled auth are not production-ready. |

## Design Adaptation Track

The comprehensive Stitch/Evia Prism review and planned design sprints are tracked in `EVIA-PRISM-DESIGN-ADAPTATION-ROADMAP.md`. Execution order is prioritized by technical debt: dependency unlock, workflow criticality, regression risk, implementation drag, and production risk.

| Priority | Design Sprint | Status | Primary Outcome | Current Risk |
| --- | --- | --- | --- | --- |
| P0 | D0 - Foundation And Shell Completion | Mostly Complete | Shared Prism tokens, shell, theme preference, icons, primitives, and CSS cleanup | Shared primitive extraction and legacy CSS leakage still need cleanup. |
| P0 | D3 - Field Library Data Surface | First Pass Complete | Dense metadata table, stats, filters, category chips, responsive cards, and create/edit panel | Import, usage count, migration status, and bulk actions still need backend-backed behavior. |
| P1 | D4 - Template Generation And Authoring UX | Started | First guided Generate from Template pass plus guided `/templates/new` authoring banner/checklist, governed-save readiness enforcement, and unmanaged-field review/promotion around the current editor | Server-side validation enforcement and richer field validation rules still need careful follow-up. |
| P1 | D5 - Editor Chrome And Records Sidebar | Not Started | Stitch-style editor frame around current Syncfusion editor | High Syncfusion regression risk; requires isolated validation and route-change checks. |
| P2 | D2 - Documents And Templates Completion | Partially Started | Full tabs/sort/view/filter/card interactions for document/template workspaces | Must preserve existing document open and template generate/preview flows. |
| P2 | D7 - Dark Mode, Accessibility, And Polish | Not Started | Cross-route dark mode, accessibility, and visual QA | Should run continuously but finish after major surface adaptation. |
| P3 | D6 - Profile, Settings, And Workspace Admin | Partially Started | Account intelligence and settings console | Several admin/security controls are not backend-backed yet. |
| P3 | D1 - Dashboard And Home Workspace | Not Started | Operational dashboard replacing marketing-style home | Dashboard metrics need real data or clearly scoped placeholders. |

## Critical Workflow Health

| Workflow | Status | Evidence |
| --- | --- | --- |
| App shell and appearance | Started | Evia Prism sidebar/topbar/mobile shell is implemented with active route state, account navigation, topbar Light/Dark toggle, and persisted appearance preference through `localStorage`. |
| Documents list | Improved | Documents render with Evia Prism cards, preview surfaces, search/status filtering, explicit Open actions, desktop/mobile no-overflow checks, and classification/retention can still be heuristic. |
| Field Library | Improved | Field Library now uses a Prism data-surface layout with summary tiles, search/select filters, category chips, dense responsive rows, icon actions, and a right-side create/edit panel while preserving the existing field APIs. |
| Create blank document | Partially Working | Opens editor, lifecycle requirements not enforced. |
| Create from template modal | Repaired | Modal now opens in browser smoke without template load errors and routes template creation to the canonical generate flow. |
| Templates list | Improved | List renders, category/search routes return data, legacy templates are normalized with filename IDs, and the page now uses Evia Prism gallery cards with lifecycle policy, managed-field counts, restrained metadata accents, plus a restored Guided creation panel and Start from Blank card. |
| Template preview | Improved | Preview normalization preserves structured SFDT, fixes the modal clipping bug, and browser smoke covers optimized and legacy template previews with no raw SFDT leak. |
| Template editor | Improved | Existing invoice template metadata and editor surface load in browser smoke; the editor now shows save-readiness notes, blocks governed saves until notes are resolved or saved as drafts, shows managed field analysis with Insert/Copy controls, and uses a review form before adding unmanaged fields to the Field Library. `/templates/new` has a Guided creation banner/checklist around the stable editor surface. The Professional Invoice editor route was verified with 18 managed fields and no stuck loading overlay. |
| Generate from template | Improved | Invoice generation now uses a guided Prism workflow with template summary cards, document-name validation, readiness checklist, lifecycle policy review, managed field labels/categories/descriptions/defaults/options, migration prompt, status badges, and tokenized preview chrome; browser validation confirms the route renders without page errors or overflow. |
| Managed field library | Started | JSON-backed library exposes 33 reusable fields through API routes, enriches template detail/list/search/save responses, reports unknown placeholders through field analysis, and now has a first UI for listing/filtering/editing fields. |
| Profile and Settings | Started | Account/preference panels now exist and expose Light/Dark appearance selection in both places. These are still placeholders for identity provider, security, and tenant settings integration. |
| Active document editor | Improved | Existing documents show normalized lifecycle metadata, and the reproduced editor-to-Templates route-change crash no longer reports page errors. |
| Editor test route | Contained | Known-crashing diagnostic route is no longer exposed in primary navigation. |
| Save document | Partially Working | Saves content, but required records controls are not enforced. |
| Version history | Partially Working | Basic versions exist, but metadata/comments/audit are incomplete. |

## Current Program Risks

- UI/UX has a first Evia Prism pass across shell, Documents, Templates, Field Library, Generate from Template, Profile, and Settings, but modals, Template Editor side panels, and editor chrome are not yet fully aligned.
- Automated browser smoke coverage is committed and passing locally, including template preview rendering guardrails.
- Frontend production build now compiles successfully without ESLint warnings; CRA still reports dependency-age notices and bundle-size guidance.
- Template schema is inconsistent across stored templates; Sprint 02 now has a managed field-library API, analysis bridge, editor-side unmanaged-field migration review, governed-save readiness enforcement, and save-time metadata enrichment, but server-side validation enforcement is still needed.
- Records lifecycle rules are not enforced server-side.
- Real-time collaboration has not been technically validated with the current editor model.
- Existing docs contain historical claims that can be mistaken for current truth; update `CURRENT-STATE.md` and this dashboard whenever a workflow changes.

## Next Gate

Sprint 02 should continue with debt-prioritized design work: finish D4 field validation rules and server-side enforcement after the first governed-save enforcement slice, then approach D5 editor chrome only with explicit Syncfusion route-change regression checks in place.

## Latest Validation

- Docker rebuild completed for `collabdoc-backend:local` and `collabdoc-frontend:local`; backend became healthy and frontend started.
- Backend health returned `UP`.
- `/api/templates/categories` returned Business, Finance, HR, and Legal.
- `/api/templates/search?q=invoice` returned invoice templates and now includes the legacy filename ID.
- `/api/documents/templates` returned helper templates instead of being treated as a document ID.
- Legacy invoice field extraction returned `CompanyName`, `ClientName`, `InvoiceNumber`, `InvoiceDate`, `DueDate`, `ServiceDescription`, and `Amount`.
- Generate-from-template smoke created an optimized SFDT document, loaded it through `/api/documents/:id`, and verified `title`, `version`, `optimizeSfdt`, and `sec` metadata/content.
- Local frontend production build compiles successfully with no ESLint warnings. CRA still reports stale Browserslist data, a Node deprecation notice from dependencies, and bundle-size guidance.
- Frontend integration tests pass: `DocumentService.test.ts` now covers the active axios-based document service with four passing tests.
- Manual browser smoke passed for Documents, Create Document modal, Templates, legacy invoice Generate form, generated-document backend verification, and generated-document editor load. The generated smoke document was removed after verification.
- Automated browser smoke is committed at `tests/smoke/collabdoc.browser-smoke.spec.js` and passes with `npm run smoke:browser` against the local Docker stack. It covers the critical generate-to-editor path, existing-template editor load, optimized and legacy template preview rendering, generation-screen internal text/emoji regressions, editor lifecycle metadata, and editor route-change page errors.
- Latest validation after the UX/warning cleanup: `npm --prefix frontend test -- --watchAll=false --runInBand` passed, `npm --prefix frontend run build` compiled successfully, Docker rebuild completed, and `npm run smoke:browser` passed two browser tests.
- Follow-up editor validation opened an existing document, confirmed classification and retention were populated from normalized metadata, navigated away to Templates, and reported no page errors.
- Follow-up generation validation confirmed the generation screen no longer displays Sprint/internal planning text, preview mode buttons are plain `Editor` and `Text`, and no page errors were reported.
- Latest validation after the editor/generation cleanup: `npm --prefix frontend test -- --watchAll=false --runInBand` passed, `npm --prefix frontend run build` compiled successfully, Docker rebuild completed, and `npm run smoke:browser` passed two browser tests.
- Follow-up template preview validation confirmed Salary Advance and Professional Invoice Template render as full-width Syncfusion document previews without loading overlays or raw SFDT/JSON. Legacy plain-text templates now receive a styled SFDT fallback.
- Latest validation after the template preview deep dive: `npm --prefix frontend test -- --watchAll=false --runInBand` passed, `npm --prefix frontend run build` compiled successfully, backend SFDT normalization smoke passed, Docker rebuild completed, and `npm run smoke:browser` passed three browser tests.
- Sprint 02 field-library validation: field-library service smoke returned 33 managed fields; `/api/templates/invoice-template` returned 18 managed invoice fields with 0 unmanaged fields; `/api/templates/invoice-template/field-analysis` returned `migrationRequired: false`; `npm --prefix frontend run build` compiled successfully; `npm --prefix frontend test -- --watchAll=false --runInBand` passed; Docker rebuild completed with a healthy backend; browser verification confirmed the managed invoice generation form renders labels, grouped categories, descriptions, select options, and the field-library status badge; `/field-library` rendered 33 fields with filters and edit form; `/templates/invoice-template` rendered 18 managed editor-side fields with Insert controls, no stuck loading overlay, and no page errors; temporary-template API verification confirmed save-time managed/unmanaged `mergeFields` write-back; `npm run smoke:browser` passed all 5 browser/API tests.
- May 21 Evia Prism validation: `get_errors` reported no issues in the touched frontend files; `npm --prefix frontend run build` compiled successfully; browser checks verified theme selection persistence in Settings and Profile; desktop and mobile headless checks verified `/documents`, `/settings`, and `/profile` in light and dark mode with no horizontal overflow; `/templates` was also checked in the live browser with no overflow. Syncfusion editor internals were not touched during this design pass.
- May 21 D4 generation validation: `get_errors` reported no issues in the touched generation, merge form, merge preview, and design-token files; `npm --prefix frontend run build` compiled successfully; browser validation of `/templates/invoice-template/generate` confirmed 18 fields, 11 required fields, managed metadata readiness, preview rendering, disabled submit until required fields are completed, no page errors, and no horizontal overflow; a dedicated 390px dark-mode headless check also passed with no page or console errors.
- May 21 Templates guided-creation validation: `get_errors` reported no issues in the touched Templates files and docs; `npm --prefix frontend run build` compiled successfully; browser validation of `/templates` confirmed the Guided creation panel and Start from Blank card render, both route to `/templates/new`, and the page has no errors or horizontal overflow; a dedicated 390px dark-mode headless check also passed with no page or console errors.
- May 21 guided template-authoring validation: `get_errors` reported no issues in the touched Template Editor files and docs; `npm --prefix frontend run build` compiled successfully; browser validation of `/templates/new` confirmed the Guided creation title, banner, checklist, editor wrapper, no loading overlay, no page errors, and no horizontal overflow; a dedicated 390px dark-mode headless check also passed with no page or console errors.
- May 21 D4 field-migration validation: `get_errors` reported no issues in the touched Template Editor files; `npm --prefix frontend run build` compiled successfully; backend API inspection confirmed managed field-analysis shape for a recently authored template; browser validation of `/templates/business-letter-template` confirmed 8 unmanaged fields, the migration callout, 8 Add to Field Library actions, and 13 field-analysis rows.
- May 21 D4 migration-review validation: `get_errors` reported no issues in the touched Template Editor files; `npm --prefix frontend run build` compiled successfully; `git diff --check` passed for the source diff; browser validation confirmed `/templates/business-letter-template` shows save-readiness notes, 8 review actions, 13 field rows, and an editable migration review form for `ServiceType`; `/templates/new` shows expected name/managed-field readiness notes. Both checked routes reported no page/console errors and no horizontal overflow. A focused Playwright smoke regression now verifies review-before-promotion behavior with a mocked field-library save so seed data is not mutated.
- May 21 D4 governed-save validation: focused Playwright smoke now verifies Template Editor blocks governed saves when readiness notes remain, sends no `PUT` before the block, and allows an explicit mocked draft save through the readiness panel. `get_errors`, frontend build, and diff checks passed for the touched source/test/docs files.