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

Current identity reference: `https://sflow-kong.salmonwave-4030412c.southeastasia.azurecontainerapps.io/identityadmin`.

The `identityadmin` URL should be treated as the administration surface. For runtime collaboration identity, the app needs the SFlow/AD OIDC authority, issuer, JWKS, and token endpoints exposed by the identity service or Kong route. The collaboration service should not trust `?user=` or client-submitted user names outside local development.

Recommended identity contract:

| Claim | Purpose |
| --- | --- |
| `sub` or `oid` | Stable user ID for collaborator identity and audit. |
| `name` or `preferred_username` | Display name in the active collaborator list. |
| `email` | Optional display and notification address. |
| `roles` or `groups` | Map SFlow/AD groups to owner, editor, and viewer permissions. |
| `tid` or tenant claim | Tenant boundary for multi-tenant deployment. |

Implementation steps:

1. Confirm the runtime OIDC discovery URL for SFlow identity, such as a `/.well-known/openid-configuration` endpoint behind Kong.
2. Configure the frontend auth provider to use the SFlow/AD authority instead of mock identity for the active JS router path.
3. Send the access token on document and collaboration API calls.
4. Re-enable backend API auth and validate JWTs using SFlow/AD issuer and JWKS.
5. Derive collaborator identity from verified token claims in the backend, not from the request body.
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
- SFlow/AD user identity and document permissions are not enforced on the collaboration API yet.

## Validation

- `npm --prefix frontend run build` compiled successfully.
- Backend collaboration route loaded successfully in Node.
- API smoke passed for join, snapshot, state polling, and collaborator presence on port `5001`.
- Browser sanity check confirmed Alice/Bob presence in two editor sessions and a remote update notification.

## Sprint Exit

The sprint can exit the demo phase once the two-user snapshot path is accepted for SFlow demonstrations. Production exit still requires AD-backed authorization, explicit conflict handling, collaborative version checkpoints, and either Syncfusion action-level collaboration or another operation-level collaboration engine.