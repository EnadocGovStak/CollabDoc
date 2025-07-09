# Collaborative Document Platform

A modern, full-stack document creation and collaboration platform built with React and Node.js.

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16.x or higher (LTS recommended)
- **npm** or **yarn** package manager  
- **Syncfusion License Key** (for Document Editor components)
- **Azure AD Application** (for authentication)

### Installation & Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd collabdoc
   
   # Install frontend dependencies
   cd frontend && npm install
   
   # Install backend dependencies  
   cd ../backend && npm install
   ```

2. **Configure environment variables:**
   ```bash
   # Frontend: Copy and edit .env file
   cp frontend/.env.example frontend/.env
   
   # Backend: Copy and edit .env file  
   cp backend/.env.example backend/.env
   ```

3. **Start development servers:**
   ```bash
   # Terminal 1: Start backend (http://localhost:5000)
   cd backend && npm run dev
   
   # Terminal 2: Start frontend (http://localhost:3000)
   cd frontend && npm start
   ```

## 📋 Features

- **📝 Rich Text Editing**: Word-like document editing with Syncfusion Document Editor
- **📄 Template System**: Create and manage document templates with merge fields
- **🔄 Version Control**: Automatic document versioning with complete history tracking
- **👥 Collaboration**: Multi-user document editing capabilities

## 📚 Documentation

### Essential Reading
- **[React Best Practices](./docs/REACT_BEST_PRACTICES.md)** - Critical guidelines for avoiding cursor reset and performance issues
- **[Cursor Reset Troubleshooting](./docs/CURSOR_RESET_FIX.md)** - Specific fix documentation for cursor position issues
- **[Development Plan Gap Analysis](./docs/DEVELOPMENT_PLAN_GAP_ANALYSIS.md)** - Comprehensive review of missing features and implementation priorities
- **[API Specification](./docs/api-spec.md)** - Complete API endpoint documentation
- **[Testing Guide](./docs/testing.md)** - Testing procedures and best practices

### Quick Reference
- **Cursor Reset Issue**: If users can't type without cursor jumping, see [CURSOR_RESET_FIX.md](./docs/CURSOR_RESET_FIX.md)
- **Performance Issues**: Check [REACT_BEST_PRACTICES.md](./docs/REACT_BEST_PRACTICES.md) for optimization guidelines
- **Backend API**: Reference [api-spec.md](./docs/api-spec.md) for endpoint usage

## 🏗️ Project Structure
```
collabdoc/
├── 📁 frontend/              # React application (TypeScript/JavaScript)
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components  
│   │   ├── services/        # API and external services
│   │   ├── contexts/        # React contexts (Auth, etc.)
│   │   └── tests/           # Frontend tests (unit/integration)
│   ├── public/              # Static assets
│   └── .env                 # Environment configuration
├── 📁 backend/               # Node.js API server
│   ├── src/
│   │   ├── routes/          # API endpoint definitions
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Express middleware
│   │   └── index.js         # Server entry point
│   ├── tests/               # Backend tests (unit/integration/e2e)
│   ├── uploads/             # Document storage
│   │   ├── documents/       # Main documents
│   │   ├── versions/        # Version history
│   │   └── temp/            # Temporary files
│   └── .env                 # Environment configuration
├── 📁 docs/                 # Documentation
├── 📁 templates/            # Shared document templates
└── README.md               # This file
```

## ⚙️ Environment Configuration

### Frontend Environment (.env)
```env
# Required: Syncfusion Document Editor
REACT_APP_SYNCFUSION_LICENSE_KEY=your_syncfusion_license_key

# Required: Azure AD Authentication  
REACT_APP_AZURE_AD_CLIENT_ID=your_azure_ad_client_id
REACT_APP_AZURE_AD_TENANT_ID=your_azure_ad_tenant_id
REACT_APP_AZURE_AD_REDIRECT_URI=http://localhost:3000

# API Configuration
REACT_APP_API_BASE_URL=http://localhost:5000

# Optional: OneDrive Integration
REACT_APP_ONEDRIVE_ENABLED=true
```

### Backend Environment (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Required: Azure AD Authentication
AZURE_AD_CLIENT_ID=your_azure_ad_client_id  
AZURE_AD_TENANT_ID=your_azure_ad_tenant_id
AZURE_AD_CLIENT_SECRET=your_azure_ad_client_secret

# Storage Configuration
STORAGE_PATH=./uploads
TEMPLATES_PATH=./templates
MAX_FILE_SIZE=50mb

# Security
JWT_SECRET=your_jwt_secret_key
CORS_ORIGIN=http://localhost:3000
```

## 🛠️ Development Workflow

### Daily Development
```bash
# Start development environment (2 terminals)
cd backend && npm run dev    # Backend server with hot reload
cd frontend && npm start     # Frontend with hot reload

# Run tests during development
npm test                     # Frontend tests (watch mode)
cd backend && npm test       # Backend tests
```

### Code Quality & Testing
```bash
# Frontend testing
cd frontend
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only  
npm run test:coverage       # Tests with coverage report

# Backend testing
cd backend  
npm run test:unit           # Unit tests
npm run test:integration    # Integration tests
npm run test:e2e           # End-to-end tests (requires running server)
npm run test:coverage      # All tests with coverage
```

### Building for Production
```bash
# Frontend production build
cd frontend && npm run build

# Backend production setup
cd backend && NODE_ENV=production npm start
```

## 📡 API Overview

### Core Endpoints

**Document Management:**
- `GET /api/documents` - List all documents
- `GET /api/documents/:id` - Get specific document with content
- `POST /api/documents` - Create new document
- `POST /api/documents/save` - Save/update document (with versioning)
- `POST /api/documents/create` - Create document from template
- `DELETE /api/documents/:id` - Delete document

**Template Management:**
- `GET /api/templates` - List available templates
- `POST /api/templates` - Create new template
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template

**Version Control:**
- `GET /api/documents/:id/versions` - List document versions
- `GET /api/documents/:id/versions/:version` - Get specific version

**Document Operations:**
- `POST /api/documents/:id/export` - Export document (PDF/DOCX)
- `POST /api/documents/:id/submit` - Submit document for workflow
- `POST /api/documents/upload` - Upload document file

### Authentication
All API endpoints require authentication via Azure AD:
```javascript
Headers: {
  'Authorization': 'Bearer <access_token>',
  'Content-Type': 'application/json'
}
```

## 🎯 Key Implementation Details

### Syncfusion Document Editor Integration
- **License Registration**: Must be done before component initialization
- **Height Management**: Use flex layout with `height: 100% !important`
- **Content Loading**: Always call `openBlank()` before loading SFDT content
- **Text Visibility**: Set `color: #000 !important` for editor content

### Document Versioning System
- **Automatic Backup**: Each save creates a version backup before overwriting
- **Version Files**: Stored as `{documentId}.v{version}.sfdt` in `/uploads/versions/`
- **Metadata Tracking**: Document metadata includes current version number and timestamps

### Merge Field Processing
- **Syntax**: Use `«FieldName»` in templates for merge fields
- **Processing**: Backend replaces merge field syntax with actual data during document creation
- **Template Variables**: Support for complex objects and nested field references

## 🔧 Common Development Tasks

### Adding a New Component
```bash
# 1. Create component file
touch frontend/src/components/NewComponent.js

# 2. Create test file
touch frontend/src/tests/unit/NewComponent.test.js

# 3. Add to component exports (if needed)
# 4. Import and use in parent components
```

### Adding a New API Endpoint
```bash
# 1. Add route definition
# Edit backend/src/routes/[router].js

# 2. Implement controller function  
# Edit backend/src/controllers/[controller].js

# 3. Update API documentation
# Edit docs/api-spec.md

# 4. Add frontend service method
# Edit frontend/src/services/[Service].js

# 5. Add tests for new endpoint
```

### Debugging Common Issues

**Document Editor Not Displaying:**
```javascript
// Check: License registration, CSS height settings, component refs
console.log('Editor ref:', editorRef.current);
console.log('License key set:', !!process.env.REACT_APP_SYNCFUSION_LICENSE_KEY);
```

**File Upload Issues:**
```javascript
// Check: Multer configuration, file size limits, temp directory permissions
// Backend logs will show multer errors and file processing status
```

**Authentication Problems:**
```javascript
// Check: Environment variables, Azure AD configuration, token format
console.log('Auth config:', { 
  clientId: !!process.env.REACT_APP_AZURE_AD_CLIENT_ID,
  tenantId: !!process.env.REACT_APP_AZURE_AD_TENANT_ID 
});
```

## 📚 Documentation & Resources

### Complete Developer Guide
📖 **[INSTRUCTIONS.md](./INSTRUCTIONS.md)** - Comprehensive development, testing, and deployment guide covering:
- Detailed architecture overview
- Complete environment setup
- Development workflow and best practices  
- API usage and extension guidelines
- Testing strategies (unit, integration, E2E)
- Deployment and CI/CD setup
- Troubleshooting and debugging
- Contributing guidelines

### Additional Documentation
- 📋 **[API Specification](./docs/api-spec.md)** - Complete API endpoint documentation
- 🧪 **[Testing Guide](./docs/testing.md)** - Testing strategies and implementation details
- 📄 **[Templates Guide](./templates/README.md)** - Template creation and management

### External References
- [Syncfusion Document Editor Documentation](https://ej2.syncfusion.com/react/documentation/document-editor/)
- [Azure AD Authentication Guide](https://learn.microsoft.com/en-us/azure/active-directory/develop/)
- [Microsoft Graph API Documentation](https://learn.microsoft.com/en-us/graph/overview)

## 🤝 Contributing

We welcome contributions! Please see our comprehensive [Contributing Guidelines](./INSTRUCTIONS.md#contributing) for:
- Code standards and style guide
- Git workflow and branching strategy
- Pull request process
- Code review guidelines
- Release process

### Quick Contributing Steps
1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'feat(scope): add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request with detailed description

## 🐛 Issues & Support

### Reporting Issues
- 🐞 **Bug Reports**: Use GitHub Issues with detailed reproduction steps
- 💡 **Feature Requests**: Describe the problem and proposed solution
- ❓ **Questions**: Check documentation first, then ask in discussions

### Getting Help
- 💬 **Team Slack**: `#doc-platform-dev` for development questions
- 📧 **Email**: `devops@yourcompany.com` for urgent issues  
- 📖 **Documentation**: Start with [INSTRUCTIONS.md](./INSTRUCTIONS.md)

## 📊 Project Status

### Current Version
**v1.0.0** - Production ready with core features implemented

### Recent Updates
- ✅ Document versioning system implemented
- ✅ Auto-save functionality added
- ✅ Comprehensive testing suite
- ✅ Azure AD authentication integration
- ✅ OneDrive storage integration

### Roadmap
- 🔄 Real-time collaboration features
- 📱 Mobile responsiveness improvements
- 🔍 Advanced search and filtering
- 📈 Analytics and reporting dashboard
- 🌐 Multi-language support

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Syncfusion** for the excellent Document Editor components
- **Microsoft** for Azure AD and OneDrive integration capabilities
- **React Team** for the robust frontend framework
- **Express.js** for the reliable backend framework

---

## 🚀 Ready to Get Started?

1. **First time?** Follow the [Quick Start](#-quick-start) guide above
2. **Want to contribute?** Read the [Contributing Guidelines](./INSTRUCTIONS.md#contributing)
3. **Need help?** Check [INSTRUCTIONS.md](./INSTRUCTIONS.md) for comprehensive guidance
4. **Found a bug?** [Open an issue](../../issues/new) with details

**Happy coding!** 🎉

## ⚠️ Important Note About Running the Application

To ensure the Collaborative Document Platform functions correctly:

1. **Both servers must be running simultaneously**:
   - The backend provides API services, document storage, and collaboration features
   - The frontend provides the user interface and document editor components

2. **Start the servers from their respective directories**:
   ```bash
   # Terminal 1: Start backend server
   cd c:\Users\User\collabdoc\backend
   npm start
   
   # Terminal 2: Start frontend server
   cd c:\Users\User\collabdoc\frontend
   npm start
   ```

3. **Start order matters**:
   - Always start the backend server first and let it initialize completely
   - Then start the frontend server in a separate terminal
   - Access the application at http://localhost:3000

4. **Common issues and solutions**:
   - Port conflicts: Kill any processes using port 3000 or 5000 before starting
   - Connection errors: Ensure backend is running before accessing document features
   - Editor errors: Check browser console for any initialization issues

5. **Verifying everything is working**:
   - Backend console should show "Server running on port 5000"
   - Frontend console should show "Compiled successfully"
   - Document editor should load without errors in the browser
