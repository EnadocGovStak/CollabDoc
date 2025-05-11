Here is a `instructions.md` tailored for **Cursor AI**, specifically for your collaborative document platform using Syncfusion, Azure AD authentication, and API-driven document workflows.

---

```markdown
# Cursor AI - Development Environment Setup

This guide provides step-by-step instructions for developers using **Cursor AI** to build and enhance the Collaborative Document Creation Platform. The platform uses **Syncfusion** for Word-like editing and **Azure AD** for authentication, and supports API-based document generation and submission.

---

## 1. Prerequisites

Ensure the following tools are installed on your machine:

- [Node.js (LTS)](https://nodejs.org/)
- [.NET SDK (if using .NET backend)](https://dotnet.microsoft.com/download)
- [Docker](https://www.docker.com/) (if using containers)
- [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli)
- [Git](https://git-scm.com/)
- Cursor AI editor (download at [https://www.cursor.sh](https://www.cursor.sh))

---

## 2. Repository Structure

```

collab-doc-platform/
├── frontend/                 # React or Angular app
│   └── .env                 # Azure AD and Syncfusion keys
├── backend/                 # API layer (Node.js or .NET)
│   └── .env                 # Secrets and endpoints
├── templates/               # Document templates (SFDT/DOCX)
├── docs/                    # Documentation and API specs
└── instructions.md          # This file

````

---

## 3. Frontend Setup (with Azure AD + Syncfusion)

### Install Dependencies

```bash
cd frontend
npm install
````

### Configure Environment

Create a `.env` file with the following:

```env
REACT_APP_SYNCFUSION_LICENSE_KEY=your_license_key
REACT_APP_AZURE_AD_CLIENT_ID=your_client_id
REACT_APP_AZURE_AD_TENANT_ID=your_tenant_id
REACT_APP_API_BASE_URL=http://localhost:5000
```

### Run Frontend

```bash
npm start
```

---

## 4. Backend Setup (Node.js/.NET API Server)

### Install Dependencies

```bash
cd backend
npm install       # or `dotnet restore` for .NET
```

### Configure Environment

Create a `.env` file with:

```env
PORT=5000
AZURE_AD_CLIENT_ID=your-client-id
AZURE_AD_TENANT_ID=your-tenant-id
AZURE_AD_CLIENT_SECRET=your-client-secret
UPLOAD_TARGET=https://your-target-endpoint.com/upload
```

### Run Backend

```bash
npm run dev       # or `dotnet run`
```

---

## 5. Core Features

### Real-Time Editing

Uses Syncfusion DocumentEditor with optional SignalR/WebSocket integration.

### Merge Fields

Use `{{FieldName}}` syntax in templates. These can be dynamically populated via API.

### Export and Upload

Documents can be exported and POSTed to any external endpoint.

```javascript
documentEditor.saveAsBlob('Docx').then(blob => {
  const formData = new FormData();
  formData.append('file', blob, 'output.docx');

  fetch(process.env.REACT_APP_API_BASE_URL + '/api/upload', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + accessToken
    },
    body: formData
  });
});
```

### Create via API

#### Endpoint

```
POST /api/documents/create
```

#### Payload

```json
{
  "templateId": "offer-letter",
  "mergeData": {
    "Name": "Wasantha",
    "Position": "COO",
    "StartDate": "2025-06-01"
  }
}
```

---

## 6. Debugging & Development Tips

* Use the Cursor AI sidebar to auto-complete or generate function code blocks.
* Keep `SFDT` templates versioned in `/templates`.
* Use `Cursor AI Ask` to explain code logic or suggest test cases.
* Enable live share for collaborative debugging in Cursor with your team.

---

## 7. Deployment Notes

* Consider storing templates in Azure Blob Storage or a secured Git submodule.
* Protect endpoints with Azure AD token validation middleware.
* Use CI/CD (e.g., GitHub Actions or Azure DevOps) for staging and production pipelines.

---

## 8. Contribution Guidelines

* Commit with clear messages.
* Follow consistent formatting and linting.
* Document new API endpoints in `/docs/api-spec.md`.

---

## 9. Support

For support, reach out on Slack `#doc-platform-dev` or email `devops@yourcompany.com`.

---

```

Let me know if you want to split this into `frontend/` and `backend/` versions or export as a downloadable file.
```
