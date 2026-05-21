# Sprint 05- Production Hardening

## Goal

Make the application deployable and supportable for production use.

## Scope

1. Enforce authentication and authorization on backend APIs.
2. Add role-based access for template admins, document editors, viewers, and records managers.
3. Add audit logs for template changes, document saves, classification changes, finalization, and access.
4. Decide and implement production storage architecture.
5. Add CI checks for frontend, backend, API contracts, and browser smoke tests.
6. Harden uploads and file path handling.
7. Review CORS, secrets, environment variables, and Docker configuration.
8. Add operational logging and error handling.
9. Update deployment documentation.
10. Finalize production UI navigation, permission states, audit visibility, and user-facing error states.

## Production Storage Decision Needed

The current backend uses local file storage. Production should choose one of these paths:

- Database for metadata plus blob storage for document/template content.
- Managed document storage service plus database metadata.
- File storage only for development, with migration before production.

## Acceptance Criteria

- Protected APIs reject unauthenticated requests.
- Admin operations are enforced server-side.
- Audit events exist for lifecycle-critical actions.
- CI fails on broken critical workflows.
- Production configuration is documented and repeatable.
- Secrets are not stored in source.
- Deployment documentation matches the actual runtime architecture.
- Global progress monitoring is maintained through `PROGRAM-STATUS.md` and CI/test evidence.
- UX has passed final production review against `UI-UX-REVIEW.md`.

## Sprint Exit

The system is ready for a controlled production pilot with known operational procedures and test coverage.