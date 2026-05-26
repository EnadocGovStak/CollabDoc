# Sprint 04- Real-Time Collaboration

Status: Demo MVP implemented, production coauthoring not complete.

Last updated: May 26, 2026.

## Goal

Enable real-time multi-user document collaboration without corrupting editor content or lifecycle metadata.

## Current Slice

The first two-user happy path is implemented as a lightweight snapshot-sync collaboration layer:

- Backend room API at `/api/collaboration/:documentId/*` for join, state polling, snapshot sync, and leave.
- Frontend collaboration service that resolves a current user from SFlow-style identity globals, `window.authContext`, stored identity, or `?user=` for local demo sessions.
- Active document editor presence indicators, live connection state, collaborator avatars, and remote-update status.
- Debounced SFDT snapshot publishing from the editor and polling-based remote snapshot application.
- Local demo stack verified on alternate ports: backend `http://localhost:5001`, frontend `http://localhost:3001`.

This is suitable for a controlled SFlow demo. It is not yet production-grade simultaneous coauthoring because it uses last-write-wins SFDT snapshots rather than operation-level merge or Syncfusion collaborative editing actions.

## Scope

1. Done - Run a technical spike on the collaboration engine.
2. Done - Choose an implementation path that works quickly with Syncfusion Document Editor content.
3. Done - Add collaboration sessions for documents.
4. Done - Add presence indicators and active user list.
5. Done for demo - Sync edits between two or more users through debounced SFDT snapshots.
6. Partial - Handle disconnect and reconnect behavior through polling heartbeat and presence TTL.
7. Pending - Capture collaborative save checkpoints as explicit document versions.
8. Pending - Add basic permissions: owner, editor, viewer.
9. Partial - Add UX for presence, connection state, reconnect, and conflict states.

## Candidate Approaches

- Current demo: SFDT snapshot sync with polling, presence TTL, and last-write-wins updates.
- Recommended production path: Syncfusion-supported collaborative editing actions if available and suitable for the licensed editor version.
- Alternative production paths: Microsoft Fluid Framework, Yjs with a document model adapter, or an operational transform/CRDT layer behind editor serialization checkpoints.

## SFlow Identity And AD Path

Current identity admin reference: `https://sflow-kong.salmonwave-4030412c.southeastasia.azurecontainerapps.io/identityadmin`.

Runtime OIDC discovery endpoint verified on May 26, 2026: `https://sflow-kong.salmonwave-4030412c.southeastasia.azurecontainerapps.io/identity/.well-known/openid-configuration`.

Public OIDC metadata discovered:

| Setting | Value |
| --- | --- |
| Issuer | `https://sflow-kong.salmonwave-4030412c.southeastasia.azurecontainerapps.io/identity` |
| Authorization endpoint | `https://sflow-kong.salmonwave-4030412c.southeastasia.azurecontainerapps.io/identity/connect/authorize` |
| Token endpoint | `https://sflow-kong.salmonwave-4030412c.southeastasia.azurecontainerapps.io/identity/connect/token` |
| JWKS URI | `https://sflow-kong.salmonwave-4030412c.southeastasia.azurecontainerapps.io/identity/.well-known/jwks` |

The `identityadmin` URL should be treated as the administration surface. For runtime collaboration identity, the app needs the SFlow/AD OIDC authority, issuer, JWKS, and token endpoints exposed by the identity service or Kong route. The collaboration service should not trust `?user=` or client-submitted user names outside local development.

The backend now has optional JWT validation support through `backend/src/middleware/auth.js`. The collaboration API derives collaborator identity from verified token claims when a valid bearer token is present. Local demo fallback remains available when auth is disabled.

Backend environment configuration:

```env
AUTH_REQUIRED=true
AUTH_ISSUER=https://sflow-kong.salmonwave-4030412c.southeastasia.azurecontainerapps.io/identity
AUTH_JWKS_URI=https://sflow-kong.salmonwave-4030412c.southeastasia.azurecontainerapps.io/identity/.well-known/jwks
AUTH_AUDIENCE=<collabdoc-api-audience-from-sflow>
```

Frontend environment configuration:

```env
REACT_APP_AUTH_PROVIDER=sflow
REACT_APP_SFLOW_AUTHORITY=https://sflow-kong.salmonwave-4030412c.southeastasia.azurecontainerapps.io/identity
REACT_APP_SFLOW_CLIENT_ID=<collabdoc-spa-client-id-from-sflow>
REACT_APP_SFLOW_SCOPE=openid profile email
REACT_APP_SFLOW_REDIRECT_URI=http://localhost:3001/
```

`AUTH_AUDIENCE` and `REACT_APP_SFLOW_CLIENT_ID` must come from SFlow Identity Admin. Do not guess these values in source code.

Recommended identity contract:

| Claim | Purpose |
| --- | --- |
| `sub` or `oid` | Stable user ID for collaborator identity and audit. |
| `name` or `preferred_username` | Display name in the active collaborator list. |
| `email` | Optional display and notification address. |
| `roles` or `groups` | Map SFlow/AD groups to owner, editor, and viewer permissions. |
| `tid` or tenant claim | Tenant boundary for multi-tenant deployment. |

Implementation steps:

1. Done - Confirm the runtime OIDC discovery URL for SFlow identity behind Kong.
2. Partial - Configure frontend identity settings for the SFlow/AD authority.
3. Partial - Send bearer tokens on collaboration API calls when a token exists in `window.authContext`, `window.sflowIdentity`, or OIDC browser storage.
4. Partial - Add backend JWT validation using SFlow/AD issuer and JWKS; enable with `AUTH_REQUIRED=true`.
5. Done for collaboration API - Derive collaborator identity from verified token claims in the backend when JWT auth is active.
6. Enforce document room authorization before join, state, snapshot, and leave actions.
7. Map SFlow/AD roles or groups to document permissions: owner, editor, viewer.
8. Keep `?user=` support only as a local demo fallback when auth is disabled.

## Acceptance Criteria

- Done for demo - Two users can edit the same document and see changes propagate through SFDT snapshots.
- Done for demo - Presence appears within a short delay.
- Partial - Reconnect restores room presence, but local edit conflict handling still needs hardening.
- Pending - Collaborative saves create understandable versions.
- Pending - Viewers cannot edit.
- Final documents cannot start editable collaboration sessions.
- Done for demo - Collaboration UX does not crowd or destabilize the document editor.
- Done - `PROGRAM-STATUS.md` reflects collaboration workflow health after validation.

## Risks

- Syncfusion content may not support fine-grained real-time operations cleanly.
- SFDT serialization may require checkpoint-based collaboration rather than character-level CRDT edits.
- Conflict handling must be designed before production use.
- Snapshot sync is vulnerable to last-writer-wins overwrites during true simultaneous editing.
- SFlow/AD JWT validation support exists, but enforcement is disabled until `AUTH_REQUIRED=true` and the correct API audience are configured.
- Document-level permissions are not enforced on the collaboration API yet.

## Validation

- `npm --prefix frontend run build` compiled successfully.
- Backend collaboration route loaded successfully in Node.
- SFlow OIDC discovery endpoint was verified and public issuer/JWKS metadata were documented.
- Auth-disabled collaboration smoke confirmed local demo identity still works.
- `AUTH_REQUIRED=true` collaboration smoke confirmed missing bearer tokens are rejected with `401`.
- API smoke passed for join, snapshot, state polling, and collaborator presence on port `5001`.
- Browser sanity check confirmed Alice/Bob presence in two editor sessions and a remote update notification.

## Sprint Exit

The sprint can exit the demo phase once the two-user snapshot path is accepted for SFlow demonstrations. Production exit still requires AD-backed authorization, explicit conflict handling, collaborative version checkpoints, and either Syncfusion action-level collaboration or another operation-level collaboration engine.