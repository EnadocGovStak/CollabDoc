# Collaborative Document Platform API Specification

## Authentication

All API endpoints require authentication via Azure AD. Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## API Endpoints

### Documents

#### Get All Documents

```
GET /api/documents
```

Returns all documents for the authenticated user.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Document Name",
    "description": "Optional description",
    "templateId": "uuid-of-template",
    "createdBy": "user-id",
    "createdAt": "2023-07-15T10:30:00Z",
    "updatedAt": "2023-07-15T14:45:00Z",
    "status": "draft"
  }
]
```

#### Get Document by ID

```
GET /api/documents/:id
```

Returns a specific document, including its content.

**Response:**
```json
{
  "id": "uuid",
  "name": "Document Name",
  "description": "Optional description",
  "content": "SFDT-formatted-content",
  "templateId": "uuid-of-template",
  "createdBy": "user-id",
  "createdAt": "2023-07-15T10:30:00Z",
  "updatedAt": "2023-07-15T14:45:00Z",
  "status": "draft"
}
```

#### Create Document

```
POST /api/documents
```

Creates a new document.

**Request Body:**
```json
{
  "name": "Document Name",
  "content": "SFDT-formatted-content",
  "templateId": "optional-template-id"
}
```

**Response:**
```json
{
  "documentId": "uuid",
  "name": "Document Name",
  "createdAt": "2023-07-15T10:30:00Z"
}
```

#### Update Document

```
PUT /api/documents/:id
```

Updates an existing document.

**Request Body:**
```json
{
  "name": "Updated Name",
  "content": "Updated-SFDT-content",
  "status": "draft"
}
```

**Response:**
```json
{
  "documentId": "uuid",
  "name": "Updated Name",
  "updatedAt": "2023-07-15T14:45:00Z"
}
```

#### Delete Document

```
DELETE /api/documents/:id
```

Deletes a document. Requires Admin role.

**Response:** 204 No Content

#### Create from Template

```
POST /api/documents/create
```

Creates a document from a template with merge data.

**Request Body:**
```json
{
  "templateId": "uuid-of-template",
  "mergeData": {
    "Name": "John Doe",
    "Position": "Manager",
    "StartDate": "2023-08-01"
  }
}
```

**Response:**
```json
{
  "documentId": "uuid",
  "name": "Template Name - 7/15/2023",
  "createdAt": "2023-07-15T10:30:00Z"
}
```

#### Export Document

```
POST /api/documents/:id/export
```

Exports a document as DOCX.

**Response:**
```json
{
  "message": "Document exported successfully",
  "downloadUrl": "/api/documents/uuid/download"
}
```

#### Submit Document

```
POST /api/documents/:id/submit
```

Submits a document to an external system.

**Response:**
```json
{
  "documentId": "uuid",
  "status": "submitted",
  "submittedAt": "2023-07-15T14:45:00Z"
}
```

#### Upload Document

```
POST /api/documents/upload
```

Uploads a DOCX document and converts it to SFDT.

**Request:** Multipart form data with 'file' field containing DOCX file.

**Response:**
```json
{
  "documentId": "uuid",
  "name": "Uploaded Document",
  "createdAt": "2023-07-15T10:30:00Z"
}
```

### Templates

#### Get All Templates

```
GET /api/templates
```

Returns all available templates.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Template Name",
    "description": "Template description",
    "createdBy": "user-id",
    "createdAt": "2023-07-15T10:30:00Z",
    "updatedAt": "2023-07-15T14:45:00Z"
  }
]
```

#### Get Template by ID

```
GET /api/templates/:id
```

Returns a specific template, including its content.

**Response:**
```json
{
  "id": "uuid",
  "name": "Template Name",
  "description": "Template description",
  "content": "SFDT-formatted-content",
  "createdBy": "user-id",
  "createdAt": "2023-07-15T10:30:00Z",
  "updatedAt": "2023-07-15T14:45:00Z"
}
```

#### Create Template

```
POST /api/templates
```

Creates a new template. Requires Admin role.

**Request Body:**
```json
{
  "name": "Template Name",
  "description": "Template description",
  "content": "SFDT-formatted-content"
}
```

**Response:**
```json
{
  "templateId": "uuid",
  "name": "Template Name",
  "createdAt": "2023-07-15T10:30:00Z"
}
```

#### Update Template

```
PUT /api/templates/:id
```

Updates an existing template. Requires Admin role.

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "content": "Updated-SFDT-content"
}
```

**Response:**
```json
{
  "templateId": "uuid",
  "name": "Updated Name",
  "updatedAt": "2023-07-15T14:45:00Z"
}
```

#### Delete Template

```
DELETE /api/templates/:id
```

Deletes a template. Requires Admin role.

**Response:** 204 No Content

#### Upload Template

```
POST /api/templates/upload
```

Uploads a DOCX template and converts it to SFDT. Requires Admin role.

**Request:** Multipart form data with 'file' field containing DOCX file.

**Response:**
```json
{
  "templateId": "uuid",
  "name": "Uploaded Template",
  "createdAt": "2023-07-15T10:30:00Z"
}
```

## Status Codes

- 200: Success
- 201: Created
- 204: No Content (successful deletion)
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error 