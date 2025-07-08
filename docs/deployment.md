# Azure Web App Deployment Guide

This guide explains how to deploy the CollabDoc application to Azure Web Apps using GitHub Actions.

## Prerequisites

1. **Azure Web Apps**: You need two Azure Web Apps:
   - One for the backend (Node.js app)
   - One for the frontend (React SPA)

2. **Publish Profiles**: Download the publish profiles for both web apps from Azure Portal

3. **GitHub Secrets**: Set up the following secrets in your GitHub repository

## Required GitHub Secrets

### Backend Secrets
- `AZURE_WEBAPP_PUBLISH_PROFILE_BACKEND` - Backend web app publish profile content
- `AZURE_BACKEND_APP_NAME` - Name of your backend Azure Web App

### Frontend Secrets
- `AZURE_WEBAPP_PUBLISH_PROFILE_FRONTEND` - Frontend web app publish profile content
- `AZURE_FRONTEND_APP_NAME` - Name of your frontend Azure Web App

### Environment Variables for Frontend Build
- `REACT_APP_API_BASE_URL` - Backend API URL (e.g., `https://your-backend-app.azurewebsites.net`)
- `REACT_APP_SYNCFUSION_LICENSE_KEY` - Your Syncfusion license key
- `REACT_APP_AZURE_AD_CLIENT_ID` - Azure AD client ID
- `REACT_APP_AZURE_AD_TENANT_ID` - Azure AD tenant ID
- `REACT_APP_AZURE_AD_REDIRECT_URI` - Azure AD redirect URI (e.g., `https://your-frontend-app.azurewebsites.net`)

## Setting Up GitHub Secrets

1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Click "New repository secret"
4. Add each secret with the appropriate value

### How to Get Publish Profiles

1. Go to Azure Portal
2. Navigate to your Web App
3. Click on "Get publish profile" in the Overview section
4. Download the `.publishsettings` file
5. Open the file and copy the entire XML content
6. Paste this content as the value for the respective secret

## Available Workflows

### 1. Full Stack Deployment (`deploy-fullstack.yml`)
- **Recommended**: Deploys both frontend and backend
- **Trigger**: Manual dispatch or push to main branch
- **Use**: For complete application deployment

### 2. Backend Only (`backend-deploy.yml`)
- **Purpose**: Deploy only backend changes
- **Trigger**: Push to main branch with changes in `/backend/**`
- **Use**: For backend-only updates

### 3. Frontend Only (`frontend-deploy.yml`)
- **Purpose**: Deploy only frontend changes
- **Trigger**: Push to main branch with changes in `/frontend/**`
- **Use**: For frontend-only updates

## Manual Deployment

To manually trigger deployment:

1. Go to your GitHub repository
2. Navigate to Actions tab
3. Select the workflow you want to run
4. Click "Run workflow"
5. Select the branch (typically `main`)
6. Click "Run workflow"

## Azure Web App Configuration

### Backend Web App Settings
- **Runtime**: Node.js 20.x
- **Startup Command**: `node src/index.js`
- **Always On**: Enabled (for production)

### Frontend Web App Settings
- **Runtime**: Static Web App or Node.js (both work)
- **Default Document**: `index.html`
- **URL Rewrite**: Handled by `web.config` (included in deployment)

## Environment Variables in Azure

### Backend Environment Variables
Set these in your backend Web App's Configuration:

```
NODE_ENV=production
PORT=80
AZURE_AD_CLIENT_ID=your_client_id
AZURE_AD_TENANT_ID=your_tenant_id
AZURE_AD_CLIENT_SECRET=your_client_secret
STORAGE_PATH=D:\home\site\wwwroot\uploads
TEMPLATES_PATH=D:\home\site\wwwroot\templates
MAX_FILE_SIZE=50mb
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=https://your-frontend-app.azurewebsites.net
```

### Frontend Environment Variables
These are built into the app during the GitHub Actions build process using the secrets.

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are properly listed in package.json
   - Check for TypeScript compilation errors

2. **Deployment Failures**
   - Verify publish profile is correctly copied
   - Check Azure Web App is running
   - Ensure web.config is properly generated

3. **Runtime Errors**
   - Check Azure Web App logs in Azure Portal
   - Verify environment variables are set correctly
   - Check file paths (Azure uses `D:\home\site\wwwroot\`)

4. **CORS Issues**
   - Ensure backend CORS_ORIGIN matches frontend URL
   - Check that API calls use correct backend URL

### Debugging Steps

1. **Check GitHub Actions Logs**
   - Go to Actions tab in GitHub
   - Click on the failed workflow
   - Examine the logs for specific errors

2. **Check Azure Web App Logs**
   - Go to Azure Portal
   - Navigate to your Web App
   - Go to Monitoring > Log stream
   - Check Application Logs

3. **Test Local Deployment**
   - Build frontend locally: `cd frontend && npm run build`
   - Test backend locally: `cd backend && npm start`

## File Structure After Deployment

### Backend Deployment
```
/home/site/wwwroot/
├── src/
├── node_modules/
├── package.json
├── web.config
├── uploads/
└── templates/
```

### Frontend Deployment
```
/home/site/wwwroot/
├── static/
├── index.html
├── manifest.json
├── web.config
└── other React build files
```

## Security Considerations

1. **Secrets Management**: Never commit secrets to code
2. **Environment Variables**: Use Azure Web App configuration for sensitive data
3. **CORS**: Configure CORS properly for your specific domains
4. **Authentication**: Ensure Azure AD is properly configured for production

## Performance Optimization

1. **Frontend**: Enable compression and caching in Azure Web App
2. **Backend**: Use Azure Application Insights for monitoring
3. **Storage**: Consider using Azure Blob Storage for file uploads in production
4. **Database**: Consider migrating from file-based storage to Azure SQL or CosmosDB

## Updating Workflows

To modify the workflows:

1. Edit the appropriate `.yml` file in `.github/workflows/`
2. Update app names in the workflow files
3. Commit and push changes
4. The workflows will use the new configuration on next run

## Support

For issues with:
- **GitHub Actions**: Check GitHub Actions documentation
- **Azure Web Apps**: Check Azure Web Apps documentation
- **Application Issues**: Check the application logs and documentation
