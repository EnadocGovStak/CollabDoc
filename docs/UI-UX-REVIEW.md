# UI/UX Review

Last updated: May 21, 2026.

Short answer: I agree that the current UI/UX is not good enough for the intended product.

The application has useful building blocks, and the first Evia Prism application pass has improved the shared shell, Documents, Templates, Field Library, Generate from Template, Profile, and Settings. It is still not a complete production UX: the editor frame, modals, records lifecycle enforcement, Template Editor side panels, validation, and migration-detail review need more deliberate work.

## Completed Design Pass - May 21, 2026

- Adopted Evia Prism as the active visual direction for the app shell and primary list surfaces.
- Added persistent side navigation, topbar workspace search/actions, active route state, and mobile bottom navigation.
- Updated Documents and Templates to use matching Prism card/gallery patterns, document-preview surfaces, tokenized filters, and clearer primary actions.
- Restored the Templates Guided creation entry point with a Start from Blank card so template authoring is visible from the library again.
- Added a first guided creation layer to `/templates/new`, with checklist states around the existing editor rather than inside Syncfusion.
- Added a first Template Editor migration review action so unmanaged detected placeholders can be checked and promoted into the Field Library from Field Analysis.
- Added save-readiness notes in Template Editor for default names, lifecycle policy gaps, unmanaged fields, and weak field metadata.
- Added governed-save blocking in Template Editor, with an explicit draft-save path for incomplete templates.
- Updated Field Library and Generate from Template with first Prism workflow/data-surface passes while preserving their existing APIs and merge behavior.
- Replaced bare Profile and Settings placeholders with account/preference panels.
- Added Light/Dark appearance selection in Profile and Settings, plus a topbar quick toggle. The choice persists through `localStorage` and document-level theme tokens.
- Kept Syncfusion editor internals out of this pass because editor lifecycle and wrapper behavior are known to be fragile.

The comprehensive Stitch/Evia Prism review and planned design-adaptation sprints are tracked in `EVIA-PRISM-DESIGN-ADAPTATION-ROADMAP.md`.

## Current UX Problems

### Navigation

- The primary shell now has a coherent sidebar/topbar model, but Dashboard/Home content still needs to become a real operational entry point.
- The mobile bottom navigation works for the first pass, but the final mobile pattern still needs validation with dense document and field-library workflows.
- Editor remains exposed as a route, but its surrounding chrome has not yet been brought into the Evia Prism system.

### Visual Design

- Evia Prism tokens now drive the shared shell, Documents, Templates, Profile, and Settings.
- Modal flows, Template Editor side panels, and editor-adjacent surfaces still need the same design-system treatment.
- Shell and generation controls now use the chosen icon library where icons are needed; any remaining text-icon stand-ins should be treated as cleanup debt when touched.
- The editor pages still feel distinct from the rest of the product because Syncfusion chrome has not been adapted yet.

### Document List

- Metadata appears useful, but some values are inferred by heuristics rather than stored lifecycle truth.
- Cards now provide explicit Open actions and a calmer Prism visual hierarchy.
- Classification color remains useful as a restrained accent, but it must eventually represent enforced records metadata rather than heuristics.

### Templates List

- Template cards now use a gallery layout with preview surfaces, lifecycle policy chips, managed-field counts, and clearer Generate-first action hierarchy.
- The Templates page now has a visible Guided creation panel and Start from Blank card for authoring new governed templates.
- The page is visually improved, but create/edit/generate workflows still need deeper guidance and validation states.

### Template Preview And Generation

- The generation route now has a first guided Prism pass with summary cards, readiness state, lifecycle policy review, inline generation errors, field-library migration prompt, grouped fields, and tokenized preview chrome.
- Raw SFDT/JSON must remain hidden from normal preview and generation workflows.
- Templates with unmanaged placeholders now have a first backend-backed Add to Field Library review form in the Template Editor.
- Template authoring now has a first guided banner/checklist, migration review action, save-readiness notes, and governed-save blocking, but still needs server-side validation enforcement.

### Document Editor

- Nested scroll areas and side panes make the editor feel unstable.
- Toolbar icons are inconsistent and hard to read.
- Records fields are present but do not yet feel like mandatory lifecycle controls.
- Save/finalization states need clearer progression and confirmation.

### Error And Empty States

- Errors are often technical or generic.
- Empty states do not consistently guide the next action.
- Disabled buttons do not always explain what is missing.

## UX Direction

The product should feel like a quiet document operations workspace:

- Clear global navigation.
- Strong workflow hierarchy.
- Less color noise.
- More explicit actions.
- Fewer debug/test affordances in user paths.
- Stable editor layout.
- Records lifecycle visible as a required process, not optional metadata.
- Template creation guided by managed fields and policy.
- Light and dark mode available as a user preference, with light remaining the default for long-form document work.

## Proposed Information Architecture

- Documents
- Templates
- Field Library
- Records Policies
- Collaboration Activity
- Admin

For early sprints, only Documents, Templates, and Field Library need to be visible. Records Policies and Admin can be introduced when backed by real behavior.

## UX Guardrails By Sprint

### Sprint 01

- Remove `Editor Test` from primary navigation.
- Fix broken create-from-template paths.
- Prevent raw SFDT/JSON in normal previews.
- Add usable loading, empty, and error states.
- Establish a basic design cleanup pass for cards, buttons, and layout spacing.
- Reduce build/lint noise so UI regressions are easier to see during future work.

### Sprint 02

- Redesign template authoring around managed fields.
- Add a Field Library surface.
- Make Generate from Template a guided form workflow.
- Show field validation clearly before generation.
- Continue applying Evia Prism to template editor side panels and migration workflows without changing Syncfusion initialization behavior.

### Sprint 03

- Make classification and retention visually required before save.
- Add lifecycle status progression.
- Improve version history and finalization UX.

### Sprint 04

- Add collaboration presence without crowding the editor.
- Show connection state and collaborators clearly.
- Design conflict/reconnect states.

### Sprint 05

- Polish production navigation, permission states, audit visibility, and operational error states.

## UI Acceptance Criteria

Every user-facing sprint should include UX acceptance criteria:

- No debug/test route in primary production navigation.
- No raw implementation format visible in normal workflows.
- Primary action is visually clear on every page/modal.
- Required lifecycle fields are visibly required and validated.
- Layout works at common laptop and desktop sizes.
- Responsive layouts work at mobile widths without horizontal overflow.
- Light and dark modes preserve contrast and hierarchy on supported surfaces.
- Empty and error states tell users what to do next.
- Color communicates state without overwhelming the page.

## Design Recommendation

Continue the Evia Prism rollout as a controlled product-system adoption, not a decorative reskin. Keep using real API-backed data, preserve working editor behavior, and bring one workflow surface at a time into the shared tokens, spacing, and action hierarchy.