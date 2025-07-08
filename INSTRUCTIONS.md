# Collaborative Document Platform - Developer Instructions

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Environment Setup](#environment-setup)
4. [Development Workflow](#development-workflow)
5. [API Usage and Extension](#api-usage-and-extension)
6. [Best Practices](#best-practices)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)
10. [Contributing](#contributing)

---

## Project Overview

The Collaborative Document Platform is a modern web application that provides:

- **Rich Text Editing**: Word-like document editing using Syncfusion Document Editor
- **Template System**: Create and manage document templates with merge fields
- **Version Control**: Automatic document versioning with history tracking
- **Real-time Collaboration**: Multi-user document editing capabilities
- **Records Management**: Document classification and retention policies
- **Cloud Integration**: OneDrive integration for document storage
- **Authentication**: Azure AD integration for secure access

### Technology Stack

**Frontend:**
- React 18.2.0 with TypeScript support
- Syncfusion Document Editor Components
- Azure AD Authentication (@azure/msal-react)
- React Router for navigation
- Axios for API communication

**Backend:**
- Node.js with Express.js
- File-based storage for documents and templates
- Multer for file upload handling
- UUID for document identification
- CORS and security middleware

---

## Architecture

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │  File Storage   │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (Local/Cloud) │
│                 │    │                 │    │                 │
│ - Document      │    │ - REST API      │    │ - Documents     │
│   Editor        │    │ - File Handling │    │ - Templates     │
│ - Auth Context  │    │ - Versioning    │    │ - Versions      │
│ - Services      │    │ - Controllers   │    │ - Metadata      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   Azure AD      │    │   OneDrive      │
│   (Auth)        │    │   (Storage)     │
└─────────────────┘    └─────────────────┘
```

### Directory Structure

```
collabdoc/
├── frontend/                    # React application
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── DocumentEditor.js
│   │   │   ├── DocumentEditorDemo.js
│   │   │   ├── VersionHistory.js
│   │   │   └── ...
│   │   ├── pages/               # Page components
│   │   │   ├── DocumentEditorPage.js
│   │   │   ├── TemplateEditorPage.js
│   │   │   └── ...
│   │   ├── services/            # API and external services
│   │   │   ├── DocumentService.js
│   │   │   ├── OneDriveService.js
│   │   │   └── ...
│   │   ├── contexts/            # React contexts
│   │   │   └── AuthContext.js
│   │   ├── tests/               # Frontend tests
│   │   │   ├── unit/
│   │   │   └── integration/
│   │   └── config.js            # Configuration
│   ├── public/                  # Static assets
│   └── .env                     # Environment variables
├── backend/                     # Node.js API server
│   ├── src/
│   │   ├── routes/              # API route definitions
│   │   │   ├── documents.js
│   │   │   ├── templates.js
│   │   │   └── records.js
│   │   ├── controllers/         # Request handlers
│   │   │   ├── documents.js
│   │   │   └── templates.js
│   │   ├── services/            # Business logic
│   │   │   └── templateService.js
│   │   ├── middleware/          # Express middleware
│   │   │   └── auth.js
│   │   └── index.js             # Server entry point
│   ├── tests/                   # Backend tests
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   ├── templates/               # Template storage
│   ├── uploads/                 # Document storage
│   │   ├── documents/           # Main documents
│   │   ├── versions/            # Version history
│   │   └── temp/                # Temporary files
│   └── .env                     # Environment variables
├── docs/                        # Documentation
│   ├── api-spec.md
│   └── testing.md
└── templates/                   # Shared templates
```

---

## Environment Setup

### Prerequisites

1. **Node.js** (LTS version, ≥ 16.x)
2. **npm** or **yarn** package manager
3. **Syncfusion License Key** (for Document Editor components)
4. **Azure AD Application** (for authentication)

### Initial Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd collabdoc
   ```

2. **Install dependencies:**
   ```bash
   # Frontend dependencies
   cd frontend
   npm install

   # Backend dependencies
   cd ../backend
   npm install
   ```

### Frontend Configuration

Create `frontend/.env` with the following variables:

```env
# Syncfusion Configuration
REACT_APP_SYNCFUSION_LICENSE_KEY=your_syncfusion_license_key

# Azure AD Configuration
REACT_APP_AZURE_AD_CLIENT_ID=your_azure_ad_client_id
REACT_APP_AZURE_AD_TENANT_ID=your_azure_ad_tenant_id
REACT_APP_AZURE_AD_REDIRECT_URI=http://localhost:3000

# API Configuration
REACT_APP_API_BASE_URL=http://localhost:5000

# OneDrive Integration (Optional)
REACT_APP_ONEDRIVE_ENABLED=true
```

### Backend Configuration

Create `backend/.env` with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Azure AD Configuration
AZURE_AD_CLIENT_ID=your_azure_ad_client_id
AZURE_AD_TENANT_ID=your_azure_ad_tenant_id
AZURE_AD_CLIENT_SECRET=your_azure_ad_client_secret

# Storage Configuration
STORAGE_PATH=./uploads
TEMPLATES_PATH=./templates
MAX_FILE_SIZE=50mb

# Security Configuration
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:3000

# Testing Configuration (for E2E tests)
TEST_ACCESS_TOKEN=test_token_for_local_development
```

### Directory Initialization

The application will automatically create necessary directories, but you can pre-create them:

```bash
# In backend directory
mkdir -p uploads/documents uploads/versions uploads/temp templates
```

---

## Development Workflow

### Starting the Development Environment

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```
   - Server runs on `http://localhost:5000`
   - Includes hot reload with nodemon
   - Health check available at `/health`

2. **Start the frontend development server:**
   ```bash
   cd frontend
   npm start
   ```
   - Application runs on `http://localhost:3000`
   - Includes hot reload for React components

### Development Process

1. **Feature Development:**
   - Create feature branch: `git checkout -b feature/your-feature-name`
   - Implement frontend components in `frontend/src/components/`
   - Add corresponding backend API endpoints in `backend/src/routes/`
   - Update controllers and services as needed

2. **Testing During Development:**
   ```bash
   # Frontend tests (watch mode)
   cd frontend
   npm test

   # Backend tests
   cd backend
   npm test
   ```

3. **Code Quality:**
   - Follow ESLint rules configured in both frontend and backend
   - Use consistent naming conventions
   - Add TypeScript types where applicable
   - Document complex functions and components

### Debugging

#### Frontend Debugging

1. **React DevTools:** Install browser extension for component inspection
2. **Console Logging:** Use `console.log`, `console.error` for debugging
3. **Network Tab:** Monitor API calls and responses
4. **Syncfusion Debugging:**
   ```javascript
   // Enable verbose logging for Syncfusion components
   console.log('DocumentEditor instance:', editorRef.current);
   ```

#### Backend Debugging

1. **Console Logging:** Use structured logging
   ```javascript
   console.log(`[${new Date().toISOString()}] Operation:`, operation, 'Data:', data);
   ```

2. **Request Logging:** Morgan middleware logs all HTTP requests

3. **Error Handling:** Comprehensive error middleware catches and logs errors

### Hot Reload and Live Development

- **Frontend:** React's hot reload updates components instantly
- **Backend:** Nodemon restarts server on file changes
- **Database:** File-based storage means immediate persistence

---

## API Usage and Extension

### Core API Endpoints

#### Documents API

**List Documents:**
```javascript
GET /api/documents
Headers: Authorization: Bearer <token>
Response: Array of document metadata
```

**Get Document:**
```javascript
GET /api/documents/:id
Headers: Authorization: Bearer <token>
Response: Complete document with content
```

**Create Document:**
```javascript
POST /api/documents
Headers: Authorization: Bearer <token>
Content-Type: multipart/form-data
Body: FormData with document file
Response: Created document metadata
```

**Update Document:**
```javascript
POST /api/documents/save
Headers: Authorization: Bearer <token>
Content-Type: multipart/form-data
Body: FormData with document file and metadata
Response: Updated document metadata
```

**Create from Template:**
```javascript
POST /api/documents/create
Headers: Authorization: Bearer <token>
Content-Type: application/json
Body: { templateId, mergeData }
Response: Generated document
```

#### Templates API

**List Templates:**
```javascript
GET /api/templates
Response: Array of available templates
```

**Create Template:**
```javascript
POST /api/templates
Content-Type: multipart/form-data
Body: FormData with template file
Response: Created template metadata
```

#### Version Management

**Get Versions:**
```javascript
GET /api/documents/:id/versions
Response: Array of document versions
```

**Get Specific Version:**
```javascript
GET /api/documents/:id/versions/:version
Response: Document content for specific version
```

### Adding New API Endpoints

1. **Define Route:** Add to appropriate router file
   ```javascript
   // backend/src/routes/documents.js
   router.post('/api/documents/custom-action', customActionHandler);
   ```

2. **Implement Controller:**
   ```javascript
   // backend/src/controllers/documents.js
   async function customActionHandler(req, res) {
     try {
       // Implementation
       res.json({ success: true, data: result });
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   }
   ```

3. **Update Frontend Service:**
   ```javascript
   // frontend/src/services/DocumentService.js
   async customAction(documentId, data) {
     const response = await axios.post(`/api/documents/custom-action`, {
       documentId,
       ...data
     });
     return response.data;
   }
   ```

4. **Document API:** Update `docs/api-spec.md` with new endpoint

### Frontend Service Integration

**Using DocumentService:**
```javascript
import { documentService } from '../services/DocumentService';

// In component
const [documents, setDocuments] = useState([]);

useEffect(() => {
  async function loadDocuments() {
    try {
      const docs = await documentService.getDocuments(accessToken);
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  }
  loadDocuments();
}, [accessToken]);
```

---

## Best Practices

### Syncfusion Document Editor

#### Initialization
```javascript
// Always use forwardRef for editor components
const DocumentEditor = React.forwardRef((props, ref) => {
  const editorRef = useRef(null);
  
  useEffect(() => {
    // Register license before using components
    registerLicense(config.syncfusion.licenseKey);
  }, []);

  // Always call openBlank() before loading content
  useEffect(() => {
    if (editorRef.current && document) {
      editorRef.current.documentEditor.openBlank();
      // Then load content...
    }
  }, [document]);
});
```

#### Styling Requirements
```css
/* Critical CSS for DocumentEditor */
.document-editor-container {
  height: 100% !important;
  display: flex !important;
  flex-direction: column !important;
}

.document-editor-container .e-documenteditor {
  color: #000 !important; /* Ensure text visibility */
  flex: 1 !important;
}

/* Include all Syncfusion font files */
@import url('node_modules/@syncfusion/ej2-base/styles/material.css');
```

#### Content Handling
```javascript
// Proper SFDT content loading
const loadSfdtContent = (sfdtContent) => {
  try {
    if (typeof sfdtContent === 'string') {
      editor.open(sfdtContent);
    } else {
      editor.open(JSON.stringify(sfdtContent));
    }
  } catch (error) {
    console.error('Failed to load SFDT content:', error);
    // Fallback: create blank document
    editor.openBlank();
  }
};
```

### Document Version Management

#### Versioning Strategy
```javascript
// Backend: Always backup before overwrite
async function saveDocument(documentId, content) {
  const metadata = await getDocumentMetadata(documentId);
  const currentVersion = metadata.currentVersion || 1;
  
  // Copy current document to version history
  const mainPath = path.join(DOCUMENTS_DIR, `${documentId}.sfdt`);
  const versionPath = path.join(VERSIONS_DIR, `${documentId}.v${currentVersion}.sfdt`);
  
  if (await fs.exists(mainPath)) {
    await fs.copyFile(mainPath, versionPath);
  }
  
  // Save new content
  await fs.writeFile(mainPath, content);
  
  // Update metadata
  metadata.currentVersion = currentVersion + 1;
  metadata.modifiedAt = new Date().toISOString();
  await saveDocumentMetadata(documentId, metadata);
}
```

#### Version Restoration
```javascript
// Frontend: Load specific version
const loadVersion = async (documentId, version) => {
  try {
    const versionData = await documentService.getDocumentVersion(documentId, version);
    
    if (editorRef.current) {
      editorRef.current.documentEditor.openBlank();
      editorRef.current.documentEditor.open(versionData.content);
    }
  } catch (error) {
    showError('Failed to load document version');
  }
};
```

### Merge Fields Implementation

#### Template Creation
```javascript
// Use consistent merge field syntax
const MERGE_FIELD_PATTERN = /«([^»]+)»/g;

// In templates, use: «FieldName»
const templateContent = {
  "sections": [{
    "blocks": [{
      "inlines": [{
        "text": "Dear «CustomerName», your order «OrderNumber» is ready."
      }]
    }]
  }]
};
```

#### Field Processing
```javascript
// Backend: Process merge fields
function processMergeFields(content, mergeData) {
  let processedContent = content;
  
  Object.entries(mergeData).forEach(([key, value]) => {
    const pattern = new RegExp(`«${key}»`, 'g');
    processedContent = processedContent.replace(pattern, value || '');
  });
  
  return processedContent;
}
```

### Error Handling

#### Frontend Error Boundaries
```javascript
class DocumentEditorErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('DocumentEditor Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong with the document editor.</div>;
    }
    return this.props.children;
  }
}
```

#### Backend Error Handling
```javascript
// Standardized error responses
const sendError = (res, error, statusCode = 500) => {
  console.error(`[${new Date().toISOString()}] Error:`, error);
  
  res.status(statusCode).json({
    error: error.message || 'Internal server error',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

// Use in routes
router.post('/api/documents', async (req, res) => {
  try {
    // Implementation
  } catch (error) {
    sendError(res, error);
  }
});
```

### Security Best Practices

#### Input Validation
```javascript
// Backend: Validate document content
const validateDocumentContent = (content) => {
  if (!content) {
    throw new Error('Document content is required');
  }
  
  if (typeof content === 'string') {
    if (content.length > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('Document content too large');
    }
  }
  
  // Sanitize content if needed
  return content;
};
```

#### Authentication
```javascript
// Frontend: Always include auth token
const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = await getAccessToken();
  
  return fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
};
```

#### File Upload Security
```javascript
// Backend: Validate file uploads
const validateUpload = (file) => {
  const allowedTypes = ['.sfdt', '.docx', '.json'];
  const fileExt = path.extname(file.originalname).toLowerCase();
  
  if (!allowedTypes.includes(fileExt)) {
    throw new Error('Invalid file type');
  }
  
  if (file.size > 50 * 1024 * 1024) { // 50MB limit
    throw new Error('File too large');
  }
};
```

### Performance Optimization

#### Frontend Performance
```javascript
// Use React.memo for expensive components
const DocumentEditor = React.memo(({ document, onContentChange }) => {
  // Component implementation
}, (prevProps, nextProps) => {
  return prevProps.document?.id === nextProps.document?.id;
});

// Debounce auto-save
const useAutoSave = (document, delay = 5000) => {
  const [pendingChanges, setPendingChanges] = useState(false);
  
  const debouncedSave = useMemo(
    () => debounce(async (doc) => {
      await documentService.saveDocument(doc);
      setPendingChanges(false);
    }, delay),
    [delay]
  );
  
  useEffect(() => {
    if (pendingChanges && document) {
      debouncedSave(document);
    }
  }, [document, pendingChanges, debouncedSave]);
};
```

#### Backend Performance
```javascript
// Use streaming for large files
const streamDocument = (req, res) => {
  const filePath = path.join(DOCUMENTS_DIR, `${req.params.id}.sfdt`);
  const stream = fs.createReadStream(filePath);
  
  stream.on('error', (error) => {
    res.status(404).json({ error: 'Document not found' });
  });
  
  res.setHeader('Content-Type', 'application/json');
  stream.pipe(res);
};
```

---

## Testing

### Testing Strategy

The project follows the testing pyramid approach:

1. **Unit Tests** (70%): Fast, isolated tests for individual components
2. **Integration Tests** (20%): Tests for component interactions
3. **End-to-End Tests** (10%): Complete workflow tests

### Frontend Testing

#### Unit Tests

**Location:** `frontend/src/tests/unit/`

**Example: Component Testing**
```javascript
// DocumentEditor.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import DocumentEditor from '../../components/DocumentEditor';

// Mock Syncfusion components
jest.mock('@syncfusion/ej2-react-documenteditor', () => ({
  DocumentEditorContainerComponent: (props) => (
    <div data-testid="document-editor">Document Editor</div>
  )
}));

describe('DocumentEditor Component', () => {
  test('renders document editor', () => {
    render(<DocumentEditor />);
    expect(screen.getByTestId('document-editor')).toBeInTheDocument();
  });

  test('handles document loading', () => {
    const mockDocument = { id: '123', content: 'test content' };
    render(<DocumentEditor document={mockDocument} />);
    // Add assertions for document loading behavior
  });
});
```

**Running Frontend Unit Tests:**
```bash
cd frontend

# Run all unit tests
npm run test:unit

# Run tests in watch mode
npm test

# Run with coverage
npm run test:coverage
```

#### Integration Tests

**Location:** `frontend/src/tests/integration/`

**Example: Service Testing**
```javascript
// DocumentService.test.ts
import DocumentService from '../../services/DocumentService';

// Mock fetch
global.fetch = jest.fn();

describe('DocumentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getDocuments should fetch and return documents', async () => {
    const mockDocuments = [{ id: '123', name: 'Test Doc' }];
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDocuments
    });

    const result = await DocumentService.getDocuments('mock-token');
    
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/documents'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer mock-token'
        })
      })
    );
    
    expect(result).toEqual(mockDocuments);
  });
});
```

### Backend Testing

#### Unit Tests

**Location:** `backend/tests/unit/`

**Example: Service Testing**
```javascript
// templateService.test.js
const fs = require('fs');
const templateService = require('../../src/services/templateService');

// Mock fs module
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn()
}));

describe('Template Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getTemplateById should return template when it exists', () => {
    const mockTemplate = { id: '123', name: 'Test Template' };
    
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify(mockTemplate));

    const result = templateService.getTemplateById('123');
    
    expect(result).toEqual(mockTemplate);
    expect(fs.existsSync).toHaveBeenCalled();
    expect(fs.readFileSync).toHaveBeenCalled();
  });
});
```

#### Integration Tests

**Location:** `backend/tests/integration/`

**Example: API Testing**
```javascript
// documents.test.js
const request = require('supertest');
const express = require('express');
const documentsRouter = require('../../src/routes/documents');

const app = express();
app.use(express.json());
app.use('/api/documents', documentsRouter);

describe('Documents API', () => {
  test('POST /api/documents should create a new document', async () => {
    const docData = {
      name: 'New Document',
      content: '{"sfdt":"new content"}'
    };

    const response = await request(app)
      .post('/api/documents')
      .send(docData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('documentId');
    expect(response.body.name).toBe(docData.name);
  });
});
```

#### End-to-End Tests

**Location:** `backend/tests/e2e/`

**Setup:** Requires running backend server

**Example: Workflow Testing**
```javascript
// document-workflow.test.js
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000';
const ACCESS_TOKEN = process.env.TEST_ACCESS_TOKEN;

describe('Document Workflow (E2E)', () => {
  let templateId;
  let documentId;

  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  test('should create template, document, and submit workflow', async () => {
    // 1. Create template
    const templateResponse = await api.post('/api/templates', {
      name: 'E2E Test Template',
      content: '{"sfdt":"Template with «Name» field"}'
    });
    
    expect(templateResponse.status).toBe(201);
    templateId = templateResponse.data.templateId;

    // 2. Create document from template
    const docResponse = await api.post('/api/documents/create', {
      templateId,
      mergeData: { Name: 'Test User' }
    });
    
    expect(docResponse.status).toBe(201);
    documentId = docResponse.data.documentId;

    // 3. Update document
    const updateResponse = await api.put(`/api/documents/${documentId}`, {
      name: 'Updated Document',
      content: '{"sfdt":"Updated content"}'
    });
    
    expect(updateResponse.status).toBe(200);

    // 4. Submit document
    const submitResponse = await api.post(`/api/documents/${documentId}/submit`);
    
    expect(submitResponse.status).toBe(200);
    expect(submitResponse.data.status).toBe('submitted');
  });
});
```

### Test Configuration

#### Frontend Jest Configuration

Located in `frontend/package.json`:
```json
{
  "jest": {
    "collectCoverageFrom": [
      "src/**/*.{js,jsx,ts,tsx}",
      "!src/**/*.d.ts",
      "!src/index.tsx",
      "!src/reportWebVitals.ts"
    ],
    "coverageThreshold": {
      "global": {
        "statements": 50,
        "branches": 50,
        "functions": 50,
        "lines": 50
      }
    },
    "coverageReporters": ["text", "lcov"]
  }
}
```

#### Backend Jest Configuration

Add to `backend/package.json`:
```json
{
  "jest": {
    "testEnvironment": "node",
    "collectCoverageFrom": [
      "src/**/*.js",
      "!src/index.js"
    ],
    "coverageThreshold": {
      "global": {
        "statements": 50,
        "branches": 50,
        "functions": 50,
        "lines": 50
      }
    },
    "testTimeout": 10000
  },
  "scripts": {
    "test": "jest",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration",
    "test:e2e": "jest tests/e2e",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch"
  }
}
```

### Running All Tests

**Complete test suite:**
```bash
# Frontend tests
cd frontend
npm run test:all
npm run test:coverage

# Backend tests
cd backend
npm test
npm run test:coverage

# E2E tests (requires running server)
npm run test:e2e
```

### Test Best Practices

1. **Isolation:** Each test should be independent
2. **Descriptive Names:** Use clear, descriptive test names
3. **Arrange-Act-Assert:** Structure tests clearly
4. **Mock External Dependencies:** Don't rely on external services
5. **Coverage Goals:** Aim for >80% coverage on critical paths
6. **Fast Execution:** Keep unit tests under 1 second each
7. **CI Integration:** Tests should run on every pull request

---

## Deployment

### Local Development Deployment

**Using npm scripts:**
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm start
```

### Production Build

#### Frontend Production Build
```bash
cd frontend

# Create optimized production build
npm run build

# Serve static files (for testing)
npx serve -s build -l 3000
```

#### Backend Production Setup
```bash
cd backend

# Install production dependencies only
npm ci --only=production

# Start in production mode
NODE_ENV=production npm start
```

### Environment-Specific Configuration

#### Development Environment
```env
# frontend/.env.development
REACT_APP_API_BASE_URL=http://localhost:5000
REACT_APP_AZURE_AD_REDIRECT_URI=http://localhost:3000

# backend/.env.development
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

#### Production Environment
```env
# frontend/.env.production
REACT_APP_API_BASE_URL=https://api.yourcompany.com
REACT_APP_AZURE_AD_REDIRECT_URI=https://docs.yourcompany.com

# backend/.env.production
NODE_ENV=production
PORT=80
CORS_ORIGIN=https://docs.yourcompany.com
```

### Cloud Deployment Options

#### Azure Static Web Apps (Frontend)
```yaml
# .github/workflows/azure-static-web-apps.yml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches: [ main ]

jobs:
  build_and_deploy_job:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Build And Deploy
      uses: Azure/static-web-apps-deploy@v1
      with:
        azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
        repo_token: ${{ secrets.GITHUB_TOKEN }}
        action: "upload"
        app_location: "/frontend"
        output_location: "build"
```

#### Azure App Service (Backend)
```yaml
# .github/workflows/azure-app-service.yml
name: Deploy Node.js to Azure App Service

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
    
    - name: Install dependencies
      run: |
        cd backend
        npm ci
    
    - name: Deploy to Azure App Service
      uses: azure/webapps-deploy@v2
      with:
        app-name: 'your-app-service-name'
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
        package: './backend'
```

#### Docker Deployment

**Frontend Dockerfile:**
```dockerfile
# frontend/Dockerfile
FROM node:16-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Backend Dockerfile:**
```dockerfile
# backend/Dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN mkdir -p uploads/documents uploads/versions uploads/temp templates

EXPOSE 5000

USER node
CMD ["npm", "start"]
```

**Docker Compose:**
```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    environment:
      - REACT_APP_API_BASE_URL=http://localhost:5000
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
    volumes:
      - ./backend/uploads:/app/uploads
      - ./backend/templates:/app/templates
```

### CI/CD Pipeline

#### GitHub Actions Complete Pipeline
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
        cache: 'npm'
    
    - name: Install frontend dependencies
      run: |
        cd frontend
        npm ci
    
    - name: Install backend dependencies
      run: |
        cd backend
        npm ci
    
    - name: Run frontend tests
      run: |
        cd frontend
        npm run test:coverage
    
    - name: Run backend tests
      run: |
        cd backend
        npm run test:coverage
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v2
      with:
        files: ./frontend/coverage/lcov.info,./backend/coverage/lcov.info
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to Azure
      run: |
        # Add deployment steps here
        echo "Deploying to production..."
```

### Security Considerations for Deployment

1. **Environment Variables:** Never commit secrets to repository
2. **HTTPS:** Always use HTTPS in production
3. **CORS:** Configure proper CORS origins
4. **Rate Limiting:** Implement API rate limiting
5. **File Upload Security:** Validate and sanitize uploads
6. **Authentication:** Ensure proper Azure AD configuration
7. **Monitoring:** Set up application monitoring and logging

---

## Troubleshooting

### Common Issues and Solutions

#### Syncfusion Document Editor Issues

**Problem:** Document editor not rendering or appearing blank
```javascript
// Solution: Ensure proper CSS is loaded and height is set
.document-editor-container {
  height: 100vh !important;
  display: flex !important;
  flex-direction: column !important;
}

// Check license registration
import { registerLicense } from '@syncfusion/ej2-base';
registerLicense(process.env.REACT_APP_SYNCFUSION_LICENSE_KEY);
```

**Problem:** Text not visible in document editor
```css
/* Solution: Force text color */
.e-documenteditor {
  color: #000 !important;
}

.e-documenteditor .e-content {
  color: #000 !important;
}
```

**Problem:** Document content not loading
```javascript
// Solution: Always call openBlank() before loading content
useEffect(() => {
  if (editorRef.current && document) {
    const editor = editorRef.current.documentEditor;
    
    // Critical: Open blank document first
    editor.openBlank();
    
    // Then load content
    if (document.content) {
      try {
        if (typeof document.content === 'string') {
          editor.open(document.content);
        } else {
          editor.open(JSON.stringify(document.content));
        }
      } catch (error) {
        console.error('Failed to load document:', error);
      }
    }
  }
}, [document]);
```

#### File Upload and Storage Issues

**Problem:** File uploads failing
```javascript
// Check backend multer configuration
const upload = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      const uploadDir = path.join(__dirname, '../../uploads/temp');
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, `temp-${Date.now()}-${Math.random().toString(36).substring(2)}`);
    }
  }),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

// Check frontend FormData construction
const formData = new FormData();
const blob = new Blob([content], { type: 'application/json' });
formData.append('document', blob, 'content.json');
```

**Problem:** Version history not working
```javascript
// Ensure version directory exists
const VERSIONS_DIR = path.join(__dirname, '../../uploads/versions');
await fs.mkdir(VERSIONS_DIR, { recursive: true });

// Check version backup logic
const backupCurrentVersion = async (documentId) => {
  const metadata = await getDocumentMetadata(documentId);
  const mainPath = path.join(DOCUMENTS_DIR, `${documentId}.sfdt`);
  const versionPath = path.join(VERSIONS_DIR, `${documentId}.v${metadata.currentVersion}.sfdt`);
  
  if (await fs.pathExists(mainPath)) {
    await fs.copyFile(mainPath, versionPath);
  }
};
```

#### Authentication Issues

**Problem:** Azure AD authentication not working
```javascript
// Check MSAL configuration
const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_AZURE_AD_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.REACT_APP_AZURE_AD_TENANT_ID}`,
    redirectUri: process.env.REACT_APP_AZURE_AD_REDIRECT_URI || window.location.origin
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false
  }
};

// Verify environment variables are set
console.log('MSAL Config:', {
  clientId: !!process.env.REACT_APP_AZURE_AD_CLIENT_ID,
  tenantId: !!process.env.REACT_APP_AZURE_AD_TENANT_ID,
  redirectUri: process.env.REACT_APP_AZURE_AD_REDIRECT_URI
});
```

**Problem:** API authentication failing
```javascript
// Check token format in requests
const makeAuthenticatedRequest = async (url, options = {}) => {
  const instance = await msalInstance.getTokenSilent({
    scopes: ["User.Read"]
  });
  
  return fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${instance.accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
};
```

#### Development Environment Issues

**Problem:** CORS errors during development
```javascript
// Backend: Configure CORS properly
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**Problem:** Environment variables not loading
```bash
# Ensure .env files are in correct locations
frontend/.env
backend/.env

# Check .env format (no spaces around =)
REACT_APP_API_BASE_URL=http://localhost:5000
SYNCFUSION_LICENSE_KEY=your_key_here

# Restart development servers after changing .env
```

**Problem:** Hot reload not working
```javascript
// Frontend: Check if fast refresh is enabled
// In package.json, ensure React Scripts version is recent
"react-scripts": "5.0.1"

// Backend: Check nodemon configuration
// In package.json
"scripts": {
  "dev": "nodemon src/index.js"
}
```

#### Performance Issues

**Problem:** Slow document loading
```javascript
// Implement lazy loading for large documents
const DocumentEditor = React.lazy(() => import('./DocumentEditor'));

// Use React.Suspense
<Suspense fallback={<div>Loading editor...</div>}>
  <DocumentEditor document={document} />
</Suspense>

// Implement pagination for document lists
const useDocumentsPagination = (pageSize = 10) => {
  const [page, setPage] = useState(0);
  const [documents, setDocuments] = useState([]);
  
  useEffect(() => {
    loadDocuments(page, pageSize);
  }, [page, pageSize]);
};
```

**Problem:** Memory leaks in React components
```javascript
// Clean up event listeners
useEffect(() => {
  const handleContentChange = () => {
    // Handle change
  };
  
  if (editorRef.current) {
    editorRef.current.documentEditor.contentChange = handleContentChange;
  }
  
  return () => {
    // Cleanup
    if (editorRef.current) {
      editorRef.current.documentEditor.contentChange = null;
    }
  };
}, []);

// Use AbortController for API calls
useEffect(() => {
  const controller = new AbortController();
  
  fetchDocuments({ signal: controller.signal })
    .then(setDocuments)
    .catch(error => {
      if (error.name !== 'AbortError') {
        console.error('Failed to fetch documents:', error);
      }
    });
  
  return () => controller.abort();
}, []);
```

### Debugging Tools and Techniques

#### Frontend Debugging

**React DevTools:**
```javascript
// Install React Developer Tools browser extension
// Use to inspect component state and props

// Add debugging to components
const DocumentEditor = ({ document }) => {
  console.log('DocumentEditor render:', { document });
  
  useEffect(() => {
    console.log('Document changed:', document);
  }, [document]);
  
  // Component implementation
};
```

**Network Debugging:**
```javascript
// Log all API requests
const originalFetch = window.fetch;
window.fetch = (...args) => {
  console.log('API Request:', args);
  return originalFetch(...args)
    .then(response => {
      console.log('API Response:', response);
      return response;
    });
};
```

#### Backend Debugging

**Request Logging:**
```javascript
// Enhanced Morgan logging
app.use(morgan('combined', {
  stream: {
    write: (message) => {
      console.log(`[${new Date().toISOString()}] ${message.trim()}`);
    }
  }
}));

// Custom request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
    body: req.body,
    query: req.query,
    headers: req.headers
  });
  next();
});
```

**Error Tracking:**
```javascript
// Enhanced error middleware
app.use((err, req, res, next) => {
  const errorDetails = {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString()
  };
  
  console.error('Application Error:', errorDetails);
  
  // In production, you might want to send to error tracking service
  // sendToErrorTrackingService(errorDetails);
  
  res.status(err.status || 500).json({
    error: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});
```

### Monitoring and Logging

#### Application Monitoring
```javascript
// Frontend: Basic performance monitoring
const performanceObserver = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    console.log('Performance entry:', entry);
  });
});

performanceObserver.observe({ entryTypes: ['navigation', 'resource'] });

// Backend: Health check endpoint with detailed status
app.get('/health', async (req, res) => {
  const health = {
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version
  };
  
  // Check external dependencies
  try {
    await fs.access(UPLOADS_DIR);
    health.storage = 'UP';
  } catch (error) {
    health.storage = 'DOWN';
    health.status = 'DEGRADED';
  }
  
  res.json(health);
});
```

---

## Contributing

### Code Standards

#### JavaScript/TypeScript Style Guide

**Naming Conventions:**
```javascript
// Variables and functions: camelCase
const documentId = 'doc-123';
const getDocumentById = (id) => { /* ... */ };

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = 'http://localhost:5000';
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Components: PascalCase
const DocumentEditor = () => { /* ... */ };
const VersionHistory = () => { /* ... */ };

// Files: kebab-case for utilities, PascalCase for components
document-service.js
DocumentEditor.js
```

**Code Organization:**
```javascript
// Import order:
// 1. React/external libraries
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 2. Internal utilities
import { formatDate } from '../utils/date-utils';

// 3. Components
import DocumentEditor from '../components/DocumentEditor';

// 4. Styles
import './ComponentName.css';
```

**Function Documentation:**
```javascript
/**
 * Saves a document to the server with versioning support
 * @param {Object} documentData - The document data to save
 * @param {string} documentData.id - Unique document identifier
 * @param {string} documentData.content - SFDT content string
 * @param {string} documentData.title - Document title
 * @param {string} [existingId] - ID of existing document to update
 * @returns {Promise<Object>} Saved document metadata
 * @throws {Error} When document content is invalid
 */
async function saveDocument(documentData, existingId) {
  // Implementation
}
```

#### React Best Practices

**Component Structure:**
```javascript
// Functional component with hooks
const DocumentEditor = ({ 
  document, 
  onContentChange, 
  readOnly = false 
}) => {
  // 1. Hooks
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const editorRef = useRef(null);

  // 2. Effects
  useEffect(() => {
    // Effect logic
  }, [document]);

  // 3. Event handlers
  const handleContentChange = useCallback(() => {
    // Handler logic
  }, [onContentChange]);

  // 4. Early returns
  if (error) {
    return <ErrorMessage error={error} />;
  }

  // 5. Render
  return (
    <div className="document-editor">
      {/* JSX */}
    </div>
  );
};

// PropTypes or TypeScript interfaces
DocumentEditor.propTypes = {
  document: PropTypes.object,
  onContentChange: PropTypes.func,
  readOnly: PropTypes.bool
};
```

**State Management:**
```javascript
// Use appropriate state management for complexity
// Local state for component-specific data
const [isVisible, setIsVisible] = useState(false);

// Context for app-wide state
const { user, login, logout } = useAuth();

// Custom hooks for complex logic
const useDocumentAutoSave = (document, interval = 5000) => {
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    // Auto-save logic
  }, [document, interval]);
  
  return { isSaving };
};
```

### Git Workflow

#### Branch Naming Convention
```bash
# Feature branches
feature/document-versioning
feature/onedrive-integration

# Bug fixes
bugfix/editor-height-issue
bugfix/authentication-token-refresh

# Hotfixes
hotfix/critical-security-patch

# Release branches
release/v1.2.0
```

#### Commit Message Format
```
type(scope): subject

body

footer
```

**Examples:**
```bash
feat(editor): add auto-save functionality

Implements automatic document saving every 5 seconds when content changes.
Includes debouncing to prevent excessive API calls and user feedback for save status.

Closes #123

fix(auth): resolve token refresh infinite loop

The token refresh was causing an infinite loop when the refresh token was also expired.
Added proper error handling and redirect to login page.

Fixes #456

docs(api): update document creation endpoint documentation

Added examples for merge field processing and error response formats.
```

#### Pull Request Process

1. **Create Feature Branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes with Tests:**
   - Implement feature/fix
   - Add unit tests
   - Add integration tests if needed
   - Update documentation

3. **Pre-PR Checklist:**
   ```bash
   # Run tests
   npm test
   
   # Check code style
   npm run lint
   
   # Build successfully
   npm run build
   
   # Update documentation if needed
   ```

4. **Create Pull Request:**
   - Use descriptive title
   - Include detailed description
   - Reference related issues
   - Add screenshots if UI changes

5. **PR Review Process:**
   - Code review by at least one team member
   - All tests must pass
   - Documentation updated
   - No merge conflicts

### Code Review Guidelines

#### What to Look For

**Functionality:**
- Does the code do what it's supposed to do?
- Are edge cases handled?
- Is error handling appropriate?

**Code Quality:**
- Is the code readable and well-structured?
- Are functions and variables named clearly?
- Is the code efficient?

**Testing:**
- Are there appropriate tests?
- Do tests cover edge cases?
- Are tests readable and maintainable?

**Security:**
- Is user input validated?
- Are authentication/authorization checks in place?
- Are secrets handled properly?

#### Review Checklist

```markdown
## Code Review Checklist

### Functionality
- [ ] Code accomplishes the intended purpose
- [ ] Edge cases are handled appropriately
- [ ] Error conditions are handled gracefully
- [ ] New functionality works with existing features

### Code Quality
- [ ] Code is readable and well-organized
- [ ] Functions are appropriately sized and focused
- [ ] Variable and function names are descriptive
- [ ] Code follows project conventions

### Testing
- [ ] Appropriate tests are included
- [ ] Tests pass locally
- [ ] Coverage is maintained or improved
- [ ] Tests are readable and maintainable

### Documentation
- [ ] Code is self-documenting or well-commented
- [ ] API changes are documented
- [ ] README or other docs updated if needed

### Performance
- [ ] No obvious performance issues
- [ ] Appropriate algorithms and data structures used
- [ ] No unnecessary re-renders or API calls

### Security
- [ ] Input validation is implemented
- [ ] Authentication/authorization is properly checked
- [ ] No sensitive information is exposed
```

### Release Process

#### Semantic Versioning

Follow [SemVer](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

Examples:
- `1.0.0` → `2.0.0`: Breaking API changes
- `1.0.0` → `1.1.0`: New features added
- `1.0.0` → `1.0.1`: Bug fixes

#### Release Workflow

1. **Prepare Release:**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b release/v1.2.0
   ```

2. **Update Version Numbers:**
   ```bash
   # Update package.json versions
   cd frontend && npm version 1.2.0
   cd backend && npm version 1.2.0
   ```

3. **Update Changelog:**
   ```markdown
   # Changelog
   
   ## [1.2.0] - 2023-07-15
   
   ### Added
   - Document versioning system
   - Auto-save functionality
   - OneDrive integration
   
   ### Changed
   - Improved document editor performance
   - Updated authentication flow
   
   ### Fixed
   - Fixed editor height issues
   - Resolved token refresh bugs
   ```

4. **Create Release PR:**
   - Merge release branch to main
   - Tag release: `git tag -a v1.2.0 -m "Release v1.2.0"`
   - Push tags: `git push origin --tags`

5. **Deploy to Production:**
   - CI/CD pipeline automatically deploys tagged releases
   - Monitor deployment and application health
   - Communicate release to stakeholders

### Issue Reporting

#### Bug Reports

Use this template for bug reports:

```markdown
## Bug Report

### Description
Brief description of the bug

### Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

### Expected Behavior
What you expected to happen

### Actual Behavior
What actually happened

### Screenshots
If applicable, add screenshots

### Environment
- OS: [e.g. iOS]
- Browser [e.g. chrome, safari]
- Version [e.g. 22]

### Additional Context
Any other context about the problem
```

#### Feature Requests

```markdown
## Feature Request

### Problem Statement
Is your feature request related to a problem? Please describe.

### Proposed Solution
Describe the solution you'd like

### Alternatives Considered
Describe any alternative solutions or features you've considered

### Additional Context
Add any other context or screenshots about the feature request
```

### Getting Help

#### Documentation
- Read through this INSTRUCTIONS.md file
- Check the API documentation in `docs/api-spec.md`
- Review testing documentation in `docs/testing.md`

#### Communication Channels
- **Slack:** `#doc-platform-dev` for general questions
- **GitHub Issues:** For bug reports and feature requests
- **Email:** `devops@yourcompany.com` for urgent issues

#### Common Resources
- [React Documentation](https://reactjs.org/docs/)
- [Syncfusion Document Editor](https://ej2.syncfusion.com/react/documentation/document-editor/)
- [Express.js Guide](https://expressjs.com/en/guide/)
- [Azure AD Documentation](https://docs.microsoft.com/en-us/azure/active-directory/)

---

## Appendix

### Useful Commands Reference

#### Development Commands
```bash
# Start development environment
npm run dev        # Backend
npm start          # Frontend

# Testing
npm test           # Run all tests
npm run test:unit  # Unit tests only
npm run test:e2e   # End-to-end tests
npm run test:coverage  # With coverage report

# Building
npm run build      # Create production build
npm run lint       # Check code style
npm run format     # Format code
```

#### Git Commands
```bash
# Common workflow
git checkout -b feature/branch-name
git add .
git commit -m "type(scope): description"
git push origin feature/branch-name

# Updating branch
git fetch origin
git rebase origin/main

# Release tagging
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin --tags
```

### Environment Variables Reference

#### Frontend (.env)
```env
# Required
REACT_APP_SYNCFUSION_LICENSE_KEY=your_license_key
REACT_APP_AZURE_AD_CLIENT_ID=your_client_id
REACT_APP_AZURE_AD_TENANT_ID=your_tenant_id

# Optional
REACT_APP_API_BASE_URL=http://localhost:5000
REACT_APP_AZURE_AD_REDIRECT_URI=http://localhost:3000
REACT_APP_ONEDRIVE_ENABLED=true
REACT_APP_DEBUG_MODE=false
```

#### Backend (.env)
```env
# Required
PORT=5000
AZURE_AD_CLIENT_ID=your_client_id
AZURE_AD_TENANT_ID=your_tenant_id
AZURE_AD_CLIENT_SECRET=your_client_secret

# Optional
NODE_ENV=development
STORAGE_PATH=./uploads
TEMPLATES_PATH=./templates
MAX_FILE_SIZE=50mb
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:3000

# Testing
TEST_ACCESS_TOKEN=test_token
API_URL=http://localhost:5000
```

### File Structure Templates

#### New React Component
```javascript
// ComponentName.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './ComponentName.css';

const ComponentName = ({ prop1, prop2, onAction }) => {
  const [state, setState] = useState(null);

  useEffect(() => {
    // Side effects
  }, []);

  const handleAction = () => {
    // Handle action
    onAction?.();
  };

  return (
    <div className="component-name">
      {/* Component content */}
    </div>
  );
};

ComponentName.propTypes = {
  prop1: PropTypes.string,
  prop2: PropTypes.number,
  onAction: PropTypes.func
};

ComponentName.defaultProps = {
  prop2: 0
};

export default ComponentName;
```

#### New API Route
```javascript
// routes/newRoute.js
const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');

// GET /api/new-route
router.get('/', auth(), async (req, res) => {
  try {
    // Implementation
    res.json({ data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/new-route
router.post('/', auth(), requireRole(['admin']), async (req, res) => {
  try {
    // Implementation
    res.status(201).json({ data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

---

*Last updated: 2025-01-27*
*Version: 1.0.0*
