# Evia Prism Design Adaptation Roadmap

Last updated: May 21, 2026.

This roadmap reviews the Stitch design package against the current CollabDoc implementation and turns the remaining design adaptation work into planned, testable sprints.

## Inputs Reviewed

- Stitch design screens under `stitch_collabdoc_ui_redesign` for Home/Dashboard, Documents, Templates, Field Library, Editor, Profile, and Settings.
- Light, dark, mobile, and desktop variants where available.
- Current React routes and styles for Landing, Documents, Templates, Field Library, Profile, Settings, and Document Editor.
- Current sprint documentation in `DOCS/sprint 01- stabilization` through `DOCS/sprint 05- production hardening`.
- Current program status in `DOCS/PROGRAM-STATUS.md`.

## Current Sprint Status Check

| Sprint | Current Status | What Is Actually Done | Remaining Gap |
| --- | --- | --- | --- |
| Sprint 01 - Stabilization | Exit Candidate | Route shadowing, create/generate flows, preview normalization, editor route-change crash, first card cleanup, smoke coverage, and warning noise were stabilized. | No open Sprint 01 blocker remains; deeper design, records enforcement, and production readiness are later work. |
| Sprint 02 - Template Foundation | In Progress | Managed field-library backend, first Field Library Prism pass, template analysis, generation metadata, first guided generation pass, direct field insertion, UI/API governed-save readiness enforcement, and save-time `mergeFields` enrichment exist. | Field Library import/usage/migration polish, richer unknown-placeholder migration, richer field validation, and template authoring polish remain. |
| Sprint 03 - Records Lifecycle | Not Started | Records metadata fields exist in UI and template lifecycle policy is surfaced. | Server-side lifecycle enforcement, required classification before save, final immutability, deterministic retention, audit/version UX, and records-first editor/sidebar design remain. |
| Sprint 04 - Real-Time Collaboration | Not Started | No proven real-time collaboration path yet. | Collaboration engine spike, presence, reconnect/conflict behavior, permissions, and collaborative save/version model remain. |
| Sprint 05 - Production Hardening | Not Started | Docker/local development and smoke coverage exist. | Auth, authorization, audit logs, production storage, CI gates, environment hardening, deployment readiness, and permission-state UX remain. |

## Design Adaptation Status

### Already Adapted

- Evia Prism light tokens and optional dark tokens are in `frontend/src/styles/design-system.css`.
- The shared app shell has side navigation, topbar search/actions, account navigation, active route state, and mobile bottom navigation.
- The shared shell now uses the app icon library instead of temporary text abbreviations.
- Documents and Templates received a first Prism list/card pass using real API-backed data.
- Field Library received a first Prism data-surface pass with summary tiles, filters, category chips, responsive rows, icon actions, and the existing create/edit panel.
- Generate from Template received a first guided Prism workflow with readiness state, document-name validation, lifecycle policy review, migration prompts, and tokenized merge form/preview chrome.
- Profile and Settings moved from bare placeholders into account/preference panel layouts.
- Light/Dark mode selection exists in Profile and Settings, plus a topbar quick toggle.
- Theme preference persists in `localStorage` as `collabdoc.theme`.

### Still Under-Adapted

- The Home route still behaves more like a product landing page than the operational Dashboard shown in Stitch.
- Documents is missing the full Stitch interaction set: status tabs, sort controls, grid/list toggle, collaborator indicators, archived restore affordance, and create-card pattern.
- Templates now has a Guided creation panel and Start from Blank card entry point, but still needs advanced filters, stronger category tabs, richer template preview assets, contributors/team metadata, and deeper template-authoring polish.
- Field Library is no longer visually pre-Prism, but it still needs backend-backed import schema, usage count, migration status, and bulk-action decisions.
- Generate from Template is now guided, and Template Editor has a first guided creation banner/checklist around the existing editor. Unmanaged placeholders can now be reviewed and promoted into the Field Library from the editor sidebar, save-readiness notes flag weak governance metadata, and governed saves are blocked in the UI and API until readiness notes are resolved or explicitly saved as drafts.
- The Editor screen has records controls but has not yet adopted the Stitch editor chrome/sidebar. This must be done separately and carefully because Syncfusion behavior is fragile.
- Profile is still a lightweight account page rather than the full Account Intelligence dashboard.
- Settings is still a lightweight preferences page rather than the full settings console with category navigation, workspace identity, security, members, plan details, and save workflow.
- Dark mode is not complete across modals, template editor side panels, or the Syncfusion editor frame.

## Adaptation Guardrails

- Do not copy generated Tailwind CDN HTML into the React app.
- Do not use external generated avatar or illustration URLs as product assets.
- Translate visual patterns into the existing React routes, services, and CSS token system.
- Keep real data and current API contracts ahead of static demo content.
- Keep letter spacing at `0` in implementation.
- Use the established Prism token layer before adding page-specific colors.
- Prefer data-dense, operational layouts over decorative marketing layouts.
- Keep Syncfusion editor initialization, event handler stability, and teardown behavior untouched unless the sprint is explicitly editor-focused and regression-tested.

## Planned Design Sprints

These are design-adaptation sprints that run alongside the existing product sprints. They should not replace the production roadmap; they make the product surfaces coherent while the backend and workflow capabilities continue to mature.

## Technical Debt Prioritization

The design sprint order should be driven by technical debt, not visual preference. Priority is based on five factors:

- **Dependency unlock:** Does this reduce repeated work for later surfaces?
- **Workflow criticality:** Does this affect template generation, field governance, saving, or editor reliability?
- **Regression risk:** Could this destabilize Syncfusion, generation, save behavior, or routing?
- **Implementation drag:** Is current CSS/component structure slowing every future change?
- **Production risk:** Does this block records enforcement, validation, accessibility, or supportability?

Priority levels:

- **P0:** Do first. Blocks or compounds later debt.
- **P1:** Do next. Core workflow or high-risk surface that needs controlled cleanup.
- **P2:** Do after critical workflow debt. Important but less blocking.
- **P3:** Do later. Useful polish/admin expansion with lower immediate technical debt.

## Technical-Debt-Prioritized Sprint Order

| Priority | Sprint | Why This Comes Here | Main Debt Retired |
| --- | --- | --- | --- |
| P0 | D0 - Foundation And Shell Completion | Shared tokens, icons, primitives, responsive rules, and legacy CSS cleanup reduce repeated work across every route. | Global CSS drift, temporary icon debt, duplicated page primitives, incomplete dark tokens. |
| P0 | D3 - Field Library Data Surface | Field Library is part of active Sprint 02 and is currently functional but visually/data-structure behind the Stitch target. | Metadata table scalability, governance UI debt, field-management layout debt. |
| P1 | D4 - Template Generation And Authoring UX | Template generation and authoring are core workflows; unclear managed/unmanaged states create workflow and validation debt. | Guided generation debt, unknown-placeholder migration debt, authoring validation debt. |
| P1 | D5 - Editor Chrome And Records Sidebar | Editor and records sidebar carry the highest regression risk and must be handled test-first around Syncfusion. | Editor-shell fragmentation, records-sidebar debt, route-change regression risk. |
| P2 | D2 - Documents And Templates Completion | Lists are partially adapted; remaining controls improve operations but are less blocking than field/generation/editor debt. | Filter/sort/view-mode debt, action-menu consistency, card metadata hierarchy. |
| P2 | D7 - Dark Mode, Accessibility, And Polish | Accessibility and dark-mode checks should be built into every sprint, with a final sweep after major surfaces land. | Cross-route contrast, focus, overflow, keyboard, and screen-reader debt. |
| P3 | D6 - Profile, Settings, And Workspace Admin | Started, but many admin/security controls are not backend-backed yet. | Placeholder account/admin debt, unsupported-control clarity. |
| P3 | D1 - Dashboard And Home Workspace | The home/dashboard mismatch matters, but it is less technically blocking than the field, template, and editor workflows. | Landing-vs-workspace IA debt, dashboard metric placeholder debt. |

Recommended immediate next sprint: continue **D4** authoring and migration polish, then approach **D5** only after explicit Syncfusion route-change regression checks are in place.

### Design Sprint D0 - Foundation And Shell Completion

Status: Mostly complete; shell icon cleanup completed May 21, 2026.

Technical debt priority: P0.

Debt addressed: global CSS drift, temporary text icons, duplicated page shell primitives, incomplete dark-mode tokens, and responsive layout inconsistencies.

Goal: Finish the shared Prism foundation so every later surface can use the same tokens, navigation, theme behavior, and action hierarchy.

Scope:

- Replace temporary text abbreviation icons with a consistent icon library.
- Normalize page header, toolbar, filter, card, panel, empty-state, and status-chip primitives.
- Add shared responsive constraints for pages, grids, cards, and mobile navigation.
- Extend dark tokens for common inputs, tables, modals, and editor-adjacent shells.
- Audit global CSS for legacy rules that leak into Prism pages.

Acceptance criteria:

- No primary navigation item uses text abbreviation icons.
- Shared primitives can be reused by Documents, Templates, Field Library, Profile, and Settings.
- Light and dark shell states pass desktop and mobile no-overflow checks.
- Syncfusion editor internals are untouched.

Implementation note: The shared shell now uses the app icon library instead of temporary text abbreviations for primary navigation, account navigation, search, notifications, help, theme toggle, and New Document actions. Remaining D0 work is mainly shared primitive extraction and legacy CSS leakage audit.

### Design Sprint D1 - Dashboard And Home Workspace

Status: Not started.

Technical debt priority: P3.

Debt addressed: landing-vs-workspace information architecture debt and missing operational dashboard entry points.

Goal: Adapt the Home design into a useful authenticated dashboard instead of a marketing-style landing page.

Scope:

- Replace the current landing-page composition with an operational Dashboard route.
- Use Stitch dashboard ideas carefully: workspace hero, quick actions, capability cards, recent lifecycle activity, and high-value entry points.
- Add data-backed summaries where data exists: document count, template count, managed fields, recent documents, migration-required templates, and records needing attention.
- Keep documentation/help links secondary.
- Add empty and loading states that guide users into Documents, Templates, and Field Library.

Acceptance criteria:

- `/` feels like the product workspace, not a public marketing page.
- Dashboard uses real available data or clearly marked local placeholders where the backend does not yet provide metrics.
- Primary actions are Documents, Templates, Field Library, and Create/New flows.
- Desktop and mobile layouts have no horizontal overflow in light and dark mode.

### Design Sprint D2 - Documents And Templates Completion

Status: Partially started.

Technical debt priority: P2.

Debt addressed: incomplete list controls, duplicated card patterns, action hierarchy drift, and missing view/filter modes.

Goal: Complete the Stitch-inspired operational controls for Documents and Templates while preserving current service behavior.

Scope:

- Documents: add status tabs, sort control, grid/list mode toggle, visible document visibility/classification, collaborator/presence placeholder, archived restore action, and create-card pattern.
- Documents: preserve existing search, status filtering, explicit Open actions, and editor navigation.
- Templates: add stronger category tabs, advanced filter affordance, richer template preview thumbnails, contributor/team metadata where available, and clearer lifecycle policy hierarchy. The Guided creation and Start from Blank entry point is now present.
- Templates: keep managed/unmanaged field status and Generate/Edit/Preview/Delete actions backed by current APIs.
- Add shared card/action-menu styling for both pages.

Acceptance criteria:

- Documents and Templates visually match the Stitch hierarchy more closely without introducing fake workflow behavior.
- Existing filtering, generation, preview, and editor navigation still work.
- Cards remain readable with long names and real metadata.
- Light/dark and desktop/mobile checks pass.

Implementation note: The Templates route now restores a visible Guided creation panel and a Start from Blank card that links to `/templates/new`, with a secondary path to the Field Library. Remaining D2 work is still focused on stronger category/filter controls, richer template metadata, and preview/card hierarchy.

### Design Sprint D3 - Field Library Data Surface

Status: First implementation pass complete.

Technical debt priority: P0.

Debt addressed: Sprint 02 governance UI debt, table scalability, field-management density, and dark-mode/table styling gaps.

Goal: Redesign Field Library as a high-density metadata-management workspace using the Stitch table and stats patterns.

Scope:

- Add a Prism page header with field count, category count, type count, and migration/health summary based on existing field-library data.
- Convert the current table to a denser data table with columns for field name, label, type, category, required status, description, usage, migration status, and actions.
- Add segmented filters for All, Custom, Standard, and migration-needed fields if data supports it.
- Add Create Field and Import Schema actions. Import can be disabled or placeholder until backend support exists.
- Preserve the current create/edit form, but move it into a right panel, drawer, or split view consistent with the Stitch design.
- Add dark-mode and mobile table behavior.

Acceptance criteria:

- Existing field load, filter, create, edit, and save behavior still works.
- Field Library can show 33 managed fields without cramped cards or awkward wrapping.
- Bulk-select UI is only enabled if backed by behavior; otherwise it is absent or clearly disabled.
- Desktop/mobile and light/dark checks pass.

Implementation note: The live Field Library now has a Prism page header, summary tiles, search/select filters, category chips, dense table rows with responsive mobile card behavior, required/type/category chips, icon actions, and a right-side create/edit panel. Import schema, usage count, migration status, and bulk actions remain future work because they need backend-backed behavior.

### Design Sprint D4 - Template Generation And Authoring UX

Status: Started; Generate from Template first pass, Template Editor migration review, save-readiness notes, and UI/API governed-save enforcement completed May 21, 2026.

Technical debt priority: P1.

Debt addressed: guided generation debt, unmanaged-placeholder migration debt, validation-state debt, and template authoring workflow fragmentation.

Goal: Make template generation and authoring feel like governed workflows rather than technical forms.

Scope:

- Redesign Generate from Template as a guided form with field groups, required-field validation, policy summary, and preview/readiness states.
- Add clear unmanaged-placeholder migration prompts that can lead to Field Library actions.
- Improve Template Editor side panels for managed fields, lifecycle policy, and insertion controls.
- Keep the working template content loading path stable.
- Add consistent empty/error states for templates with no managed fields, mixed managed/unmanaged fields, and invalid field data.

Acceptance criteria:

- Users can understand what data is required before generating a document.
- Managed/unmanaged field states are visible and actionable.
- Existing invoice generation still creates and opens a document.
- Template editor content does not regress into blank editor or stuck loading states.

Implementation note: The live Generate from Template route now has a guided Prism header, summary cards, readiness checklist, inline generation errors, document-name validation, lifecycle policy summary, field-library migration callout, tokenized merge form controls, and tokenized preview chrome. The `/templates/new` authoring route now also shows a Guided creation banner, creation checklist, Field Library shortcut, Save draft action, tokenized sidebar styling, save-readiness notes, governed-save blocking, and a field migration review form around the existing editor. The Template Editor Field Analysis panel now lets authors review unmanaged placeholder metadata before adding it to the Field Library and refreshes the local managed/unmanaged status after the API save. Backend template create/update routes now reject incomplete governed saves unless the caller explicitly saves a draft. Remaining D4 validation work is focused on richer field validation rules.

### Design Sprint D5 - Editor Chrome And Records Sidebar

Status: Not started; high-risk.

Technical debt priority: P1.

Debt addressed: editor-shell fragmentation, records-sidebar usability debt, route-change regression risk, and future Sprint 03 lifecycle UI dependency.

Goal: Adapt the Stitch editor chrome around Syncfusion without destabilizing the editor itself.

Scope:

- Add an editor-safe shell around the current working Syncfusion instance: title/status/autosave area, compact action bar, and right records/document-info sidebar.
- Reframe existing records fields into the Stitch-style Records Management section.
- Add document info, version status, contributors placeholder, audit trail placeholder, download/export placeholder, and archive/finalize controls only where backed or clearly disabled.
- Keep Syncfusion initialization, event callbacks, refs, and teardown behavior stable.
- Add route-change regression tests before and after the design change.

Acceptance criteria:

- Existing documents still load in `/editor/:id`.
- Generated documents still open after template generation.
- Navigating away from the editor reports no page errors.
- Finalized/read-only behavior does not regress.
- No changes are made to Syncfusion internals unless explicitly required and tested.

### Design Sprint D6 - Profile, Settings, And Workspace Admin

Status: Partially started.

Technical debt priority: P3.

Debt addressed: placeholder account/admin surfaces, unsupported-control clarity, and workspace settings organization.

Goal: Expand Profile and Settings from placeholders into useful account and workspace admin surfaces.

Scope:

- Profile: adapt the Account Intelligence layout with identity card, role/organization, permissions, recent activity, and realistic activity metrics.
- Settings: adapt the category navigation layout for Workspace, Preferences, Security, Members, Appearance, and Plan Details.
- Keep Light/Dark selection in Settings and optionally expose it in Profile as a shortcut.
- Add form controls for settings that can be local-only placeholders until backend support exists, but clearly separate saved behavior from mock behavior.
- Add disabled states for unsupported security/member actions.

Acceptance criteria:

- Profile communicates identity, role, permissions, and recent activity clearly.
- Settings has a stable category structure and appearance controls.
- Unsupported admin/security controls are not presented as fully functional.
- Light/dark and desktop/mobile checks pass.

### Design Sprint D7 - Dark Mode, Accessibility, And Polish

Status: Not started.

Technical debt priority: P2.

Debt addressed: cross-route contrast, keyboard/focus, accessible names, responsive overflow, and incomplete dark-mode coverage.

Goal: Finish cross-surface quality after the main route adaptations land.

Scope:

- Complete dark-mode styling for Field Library, generation, modals, editor chrome, Template Editor panels, and any remaining legacy surfaces.
- Run contrast checks on status chips, buttons, sidebars, and form controls.
- Verify keyboard focus, visible focus rings, labels, tab order, and screen-reader names for icon buttons.
- Add Playwright viewport checks for all major routes in light and dark mode.
- Review loading, empty, error, disabled, and permission states.

Acceptance criteria:

- All supported routes render acceptably in light and dark mode.
- Common desktop and mobile widths show no horizontal overflow.
- Icon-only buttons have accessible names.
- Controls have visible focus states.
- Browser smoke or Playwright checks cover the main design routes.

## Recommended Sequence

1. Continue D0 foundation cleanup because shared primitives and CSS leakage still affect later routes.
2. Extend D3 Field Library only where backend-backed import, usage, migration, or bulk behavior exists.
3. Continue D4 generation/authoring UX because Sprint 03 lifecycle enforcement needs clear required-field and policy states.
4. Do D5 editor chrome only as a protected sprint with explicit Syncfusion route-change regression tests.
5. Finish D2 Documents/Templates controls after the field and generation workflows are structurally cleaner.
6. Run D7 accessibility/dark-mode checks continuously, then finish the final polish sweep after the major surfaces are adapted.
7. Do D6 Profile/Settings admin expansion when backend-backed settings and permissions are clearer.
8. Do D1 Dashboard/Home once core workflows can provide reliable metrics and activity data.

## Validation Standard For Each Design Sprint

- `get_errors` on touched files.
- `npm --prefix frontend run build`.
- Browser verification on the changed route in light mode.
- Browser verification on the changed route in dark mode if theme support is expected.
- Desktop and mobile viewport checks for no horizontal overflow.
- Workflow smoke for any route that opens, previews, generates, saves, or navigates into the Syncfusion editor.
- Update `DOCS/CURRENT-STATE.md`, `DOCS/PROGRAM-STATUS.md`, and this roadmap when a design sprint changes workflow status.