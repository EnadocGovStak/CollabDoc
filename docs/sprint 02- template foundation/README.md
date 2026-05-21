# Sprint 02- Template Foundation

## Goal

Turn templates into governed reusable assets backed by a managed field library.

## Scope

1. Define the canonical template schema.
2. Define the canonical merge field schema.
3. Build backend APIs for managed fields by category, type, validation, defaults, and options.
4. Backfill existing templates with managed `mergeFields` metadata.
5. Design the Field Library UI as a first-class workspace surface.
6. Redesign Template Editor around field insertion and field metadata management.
7. Update Generate from Template to build guided forms from managed fields.
8. Add UX validation states for required fields, invalid values, and missing managed-field definitions.
9. Treat auto-extraction as a migration helper, not the long-term source of truth.

## Current Implementation Slice

Status: In progress, backend/API, generation-form, Field Library UI, template editor analysis, direct insertion controls, unmanaged-field promotion, and save-time field enrichment implemented.

Implemented in this slice:

- Seeded a JSON-backed managed field library at `backend/src/data/field-library.json`.
- Added `backend/src/services/fieldLibraryService.js` to normalize field definitions, infer unmanaged placeholders, and analyze templates against the library.
- Added managed field-library API routes:
	- `GET /api/templates/field-library`
	- `POST /api/templates/field-library`
	- compatibility aliases under `/api/templates/fields/library`
- Added template analysis API route:
	- `GET /api/templates/:id/field-analysis`
- Enriched `GET /api/templates/:id` with managed `mergeFields` and `fieldAnalysis` metadata.
- Enriched template list/search metadata with managed/unmanaged field counts and `migrationRequired`.
- Updated Generate from Template so forms use managed labels, categories, descriptions, examples, option lists, defaults, and managed/unmanaged badges.
- Added a `/generate/:templateId` route alias for direct generation links.
- Added a Field Library page at `/field-library` for listing, filtering, creating, and editing managed fields.
- Added primary navigation and Templates page entry points for the Field Library.
- Added a Template Editor field-analysis panel showing managed/unmanaged field counts, governed metadata, and copyable placeholder tokens.
- Added direct Insert controls in the Template Editor field-analysis panel for inserting managed placeholder tokens at the current editor cursor.
- Added Add to Field Library actions in the Template Editor field-analysis panel for promoting unmanaged placeholders into managed reusable fields.
- Added save-time merge-field enrichment so created/updated templates persist managed and unmanaged field metadata based on current placeholders.
- Hardened Template Editor content loading so legacy `sfdt` wrapper content is normalized before direct editor loading and no longer leaves the loading overlay stuck if Syncfusion rejects a payload.

Not implemented yet:

- Server-side enforcement of all field validation rules beyond basic required/type checks.
- Richer field-detail review and validation when promoting unknown placeholders.

## Canonical Template Fields

- `id`
- `name`
- `description`
- `category`
- `documentType`
- `content`
- `mergeFields`
- `recordsPolicy`
- `createdAt`
- `updatedAt`
- `createdBy`
- `updatedBy`
- `version`

## Canonical Merge Field Fields

- `name`
- `label`
- `type`
- `category`
- `required`
- `defaultValue`
- `description`
- `options`
- `validation`
- `exampleValue`

## Acceptance Criteria

- Admins can define a reusable field once and use it in many templates through the first Field Library UI.
- Template authors can insert or copy managed field tokens from the Template Editor analysis panel.
- Template authors can promote unmanaged detected placeholders into the Field Library from the Template Editor analysis panel.
- Unknown placeholders are detected and reported through template field analysis.
- Existing templates expose managed/unmanaged counts and are clearly flagged for migration.
- Generated forms use field labels, types, validation, defaults, and options from the field library.
- Preview and generation preserve valid editor content.
- Template and field-library screens follow the UX guardrails in `../GLOBAL-PROGRESS-MONITORING-AND-GUARDRAILS.md`.
- Generate from Template feels like a guided business workflow, not a technical form dump.
- `PROGRAM-STATUS.md` is updated when template workflow health changes.

## Validation

- Field-library service smoke returned 33 managed fields across Client, HR, Invoice, Legal, Organization, Payment, and System categories.
- Invoice template API smoke returned 18 managed fields, 0 unmanaged fields, and `migrationRequired: false`.
- Frontend production build compiled successfully.
- Frontend integration test suite passed.
- Docker rebuild completed and the backend became healthy.
- Browser verification confirmed the invoice generation form renders managed labels, categories, descriptions, select options, and the field-library status badge.
- Browser verification confirmed `/field-library` renders 33 fields, category/type filters, and the field editor.
- Browser verification confirmed `/templates/invoice-template` renders 18 managed fields in the Template Editor sidebar, hides the loading overlay, and reports no page/console errors.
- Browser verification confirmed `/templates/business-letter-template` renders 8 unmanaged fields, a migration callout, 8 Add to Field Library actions, and 13 field-analysis rows.
- API verification created a temporary template and confirmed saved placeholders persisted as managed and unmanaged `mergeFields`; the temporary template was deleted after verification.
- `npm run smoke:browser` passed all 5 browser/API smoke tests after adding coverage for Field Library, template field analysis, insertion controls, and save-time field enrichment.

## Out Of Scope

- Real-time collaboration.
- Full document retention enforcement beyond template defaults.
- Production storage migration.