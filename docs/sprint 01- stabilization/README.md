# Sprint 01- Stabilization

## Goal

Make the current app coherent, testable, and demo-stable before adding production features.

## Primary Problems

- Static API routes are shadowed by dynamic `/:id` routes.
- Create New Document modal calls missing service methods.
- Template generation forms can miss fields that exist in content.
- Preview surfaces can render raw SFDT/JSON.
- `/editor-test` exposes runtime crashes in user navigation.
- Documentation claims stability that does not match current behavior.

## Scope

1. Done - Fix route ordering in template and document routes.
2. Done - Update `NewDocumentModal` to use the active template service and generation route.
3. Done - Add a merge-field fallback path for templates that have placeholders but no managed field metadata.
4. Done - Normalize preview/generation content so structured SFDT is preserved instead of shown as raw JSON text.
5. Done - Remove or hide `Editor Test` from production navigation until it is stable.
6. Done - Establish the global progress dashboard in `PROGRAM-STATUS.md`.
7. Done - Apply the guardrails in `GLOBAL-PROGRESS-MONITORING-AND-GUARDRAILS.md` to Sprint 01 acceptance.
8. Done - Complete a first UX cleanup pass for navigation, cards, modal actions, loading states, and raw error states.
9. Done - Add smoke tests for Documents, Templates, Generate from Template, and Document Editor.
10. Done - Keep `CURRENT-STATE.md` updated with what is still broken.

## Acceptance Criteria

- `/api/templates/categories` returns categories, not "Template not found".
- `/api/templates/search` returns search results, not "Template not found".
- `/api/documents/templates` is not swallowed by the document ID route.
- Create New Document can load templates.
- Generate from Template shows required fields for templates with placeholders.
- Generated documents open in the editor with readable content.
- Main user navigation does not expose a known-crashing editor test route.
- Main user pages no longer show raw SFDT/JSON or stack traces.
- Primary actions and disabled states are clear in create/generate flows.
- `PROGRAM-STATUS.md` reflects actual workflow health after validation.
- A Playwright or equivalent smoke suite covers the critical happy paths.

## Implementation Notes

- Template and document route ordering has been corrected so static routes are reachable before dynamic `/:id` handlers.
- Template list/search responses now normalize legacy templates with filename-derived IDs and useful metadata such as category, document type, and merge-field count.
- The create-document modal now loads templates through the template service and sends template creation to `/templates/:id/generate`.
- The template merge form now uses managed `mergeFields` when available and extracts placeholders from content when metadata is missing.
- Template preview and backend generation now preserve recognized structured SFDT (`sfdt`, `sections`, `sec`, or `optimizeSfdt`).
- Generated documents now include document API-compatible metadata: `title`, timestamps, initial version history, status, and inherited records metadata.
- The primary navigation no longer exposes `/editor-test`.
- Documents and Templates list cards now use restrained white surfaces with narrow lifecycle/category accents instead of full-card pastel backgrounds and emoji-led card headers.
- Documents now include search, status filtering, result counts, explicit Open actions, and sorting that keeps placeholder `Untitled` records below named documents.
- Templates now include quieter filters, scoped card description styling, no emoji-led category/status labels, and a Generate-first action hierarchy.
- The Create New Document modal now resets its state each time it opens.
- Document editor lifecycle metadata now reuses the same fallback normalization as the Documents list, so legacy records still show classification and retention values in the editor sidebar.
- Syncfusion editor event callbacks are now stable across rerenders and the editor/container are destroyed on unmount, addressing the reproduced user-route crash when navigating away from an editor.
- Template generation fallback fields no longer expose Sprint planning text, and preview mode controls now use plain `Editor`, `Text`, and `Raw` labels.
- Template preview modal layout is scoped so it no longer inherits old card preview centering rules that clipped the Syncfusion page into a narrow column.
- Legacy plain-text templates wrapped as `sfdt` now receive a styled SFDT fallback for preview, template editing, and backend generation; real `sections`, `sec`, and `optimizeSfdt` content is preserved untouched.
- Mechanical frontend warning noise was removed from active services, list pages, template preview, and editor wrapper components.

## Validation Completed

- Docker rebuild completed for the local backend and frontend images.
- Backend health returned `UP`.
- `/api/templates/categories` returned categories instead of `Template not found`.
- `/api/templates/search?q=invoice` returned invoice templates and included the legacy invoice template ID.
- `/api/documents/templates` returned helper templates instead of a document read error.
- Legacy invoice placeholder extraction returned seven fields.
- Generate-from-template smoke created and reloaded an optimized SFDT document with the expected title and version metadata.
- Browser smoke verified Documents, Create Document modal, Templates, the legacy invoice Generate form, and generated-document editor load with no runtime crash or raw SFDT leak.
- Browser generation created `Sprint 01 Browser Smoke Invoice`, verified optimized SFDT and title/version metadata through the backend, then removed the smoke artifact.
- Automated browser smoke is committed at `tests/smoke/collabdoc.browser-smoke.spec.js` and runs with `npm run smoke:browser` while the local Docker stack is running. It covers the critical generate-to-editor workflow and the existing-template editor load path.
- The browser smoke suite now also guards that generation screens do not expose internal Sprint text or emoji mode labels, editor lifecycle metadata is populated, and navigating away from the editor does not report page errors.
- The browser smoke suite now also guards optimized and legacy template preview rendering, including full-size Syncfusion editor/canvas geometry and no raw SFDT leak.
- Local frontend production build compiles successfully with no ESLint warnings. CRA still reports stale Browserslist data, a dependency deprecation notice, and bundle-size guidance.
- Frontend integration tests pass: the active axios-based document service has four passing tests.
- Latest validation after UX/warning cleanup: `npm --prefix frontend test -- --watchAll=false --runInBand` passed, Docker rebuild completed for local images, and `npm run smoke:browser` passed two browser tests.
- Follow-up browser repro validation confirmed the Documents toolbar, Templates cleanup, and modal reset are visible in the rebuilt local Docker frontend.
- Follow-up editor repro validation opened an existing document, confirmed lifecycle fields populated from normalized records metadata, navigated to Templates, and reported no page errors.
- Follow-up generation-page repro validation confirmed `Template Fields` displays without Sprint/internal text, preview mode buttons are plain text, and no page errors were reported.
- Latest validation after the editor/generation cleanup: `npm --prefix frontend test -- --watchAll=false --runInBand` passed, `npm --prefix frontend run build` compiled successfully, Docker rebuild completed, and `npm run smoke:browser` passed two browser tests.
- Latest validation after the template preview deep dive: `npm --prefix frontend test -- --watchAll=false --runInBand` passed, `npm --prefix frontend run build` compiled successfully, backend SFDT normalization smoke passed, Docker rebuild completed, manual browser preview checks passed for Salary Advance and Professional Invoice Template, and `npm run smoke:browser` passed three browser tests.

## Remaining Sprint 01 Work

- No open Sprint 01 blocker remains from the repaired happy path, first-pass UX cleanup, or code lint warning gate.
- Carry deeper visual-system work, real template authoring/upload fidelity, legacy template migration, lifecycle enforcement, stale Browserslist maintenance, and bundle-size reduction into later sprints.

## Out Of Scope

- Real-time collaboration.
- Full records policy engine.
- Full managed field-library UI.
- Production auth and audit hardening.

## Sprint Exit

The app can be walked through end to end locally without obvious runtime crashes or broken template/document creation flows. Sprint 01 is an exit candidate once the team accepts the later-sprint backlog items above.