# Collaborative Document Platform

A modern document creation platform with real-time collaboration features, powered by Syncfusion Document Editor and Azure AD authentication.

## Features

- Word-like document editing with Syncfusion
- Azure AD authentication and authorization
- Template-based document generation
- Dynamic merge fields for document automation
- Real-time collaboration
- Document export and submission via API
- Secure document storage and versioning

## Important Implementation Notes

### Critical Dependencies
```json
{
  "@syncfusion/ej2-react-documenteditor": "^22.2.5",
  "@syncfusion/ej2-base": "^22.2.5",
  "@syncfusion/ej2-react-base": "^22.2.5",
  "react": "^18.2.0",
  "react-dom": "^18.2.0"
}
```

### Key Configuration Requirements
1. Syncfusion license key in environment variables
2. Proper CSS imports for Syncfusion components
3. Correct height and flex layout setup
4. Proper font loading configuration

### Known Issues and Solutions
1. Text Visibility: Requires specific CSS rules for text color
2. Height Calculation: Use flex layout and avoid fixed heights
3. Font Loading: Include all necessary Syncfusion font files
4. Component Refs: Always use forwardRef for document editor

See [INSTRUCTIONS.md](./INSTRUCTIONS.md) for detailed implementation guide and troubleshooting.

## Tech Stack

- **Frontend**: React.js with TypeScript
- **Backend**: Node.js API server
- **Authentication**: Azure Active Directory
- **Document Editor**: Syncfusion Document Editor
- **Real-time**: WebSocket/SignalR integration
- **Storage**: Azure Blob Storage (for templates)

## Project Structure

```
collabdoc/
├── frontend/                # React app with Syncfusion integration
│   ├── public/              # Static assets
│   ├── src/                 # Source code
│   │   ├── components/      # UI components
│   │   ├── services/        # API services and utilities
│   │   ├── pages/           # Application pages
│   │   ├── contexts/        # React contexts for state management
│   │   ├── styles/          # CSS/SCSS files
│   │   └── tests/           # Test files (unit & integration)
│   └── .env                 # Environment configuration
├── backend/                 # Node.js API server
│   ├── src/                 # Source code
│   │   ├── controllers/     # API controllers
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/          # Data models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── utils/           # Utility functions
│   ├── tests/               # Test files (unit, integration & e2e)
│   └── .env                 # Environment configuration
├── templates/               # Document templates (SFDT/DOCX)
└── docs/                    # Documentation and API specs
```

## Development Progress

- [x] Project structure setup
- [x] Frontend scaffolding
- [x] Backend API setup
- [x] Azure AD integration
- [x] Syncfusion Document Editor integration
- [x] Template management system
- [x] Document generation API
- [x] Document export and submission
- [x] Automated testing setup
- [ ] Real-time collaboration
- [ ] End-to-end testing & deployment

## Getting Started

### Prerequisites

- Node.js (LTS version)
- Azure AD tenant with registered application
- Syncfusion license key

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```
   REACT_APP_SYNCFUSION_LICENSE_KEY=your_license_key
   REACT_APP_AZURE_AD_CLIENT_ID=your_client_id
   REACT_APP_AZURE_AD_TENANT_ID=your_tenant_id
   REACT_APP_API_BASE_URL=http://localhost:5000
   ```

4. Start the development server:
   ```bash
   npm start
   ```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```
   PORT=5000
   AZURE_AD_CLIENT_ID=your_client_id
   AZURE_AD_TENANT_ID=your_tenant_id
   AZURE_AD_CLIENT_SECRET=your_client_secret
   STORAGE_PATH=./templates
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Testing

Run tests with:
```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test
```

## Deployment

See [deployment guide](docs/deployment.md) for production deployment instructions.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

[MIT License](LICENSE)

## Support

For implementation help, see [INSTRUCTIONS.md](./INSTRUCTIONS.md) or open an issue. # CollabDoc
