# Manual Azure Web App Setup Guide

Based on your Azure environment details:

## Your Azure Environment
- **Resource Group**: `GovBrunei_RG`
- **Subscription**: `Microsoft Azure Sponsorship`
- **App Service Plan**: `GovBrinei-ASP`
- **Location**: `Southeast Asia`
- **Subscription ID**: `3037519c-865b-449a-8721-ac1b0e2f8d65`

## Step 1: Create Web Apps

### Option A: Using Azure CLI Script (Recommended)
```powershell
# Run the automated script
.\scripts\create-azure-webapps.ps1
```

### Option B: Manual Creation via Azure Portal

#### Create Backend Web App
1. Go to Azure Portal → Create a Resource → Web App
2. **Subscription**: Microsoft Azure Sponsorship
3. **Resource Group**: GovBrunei_RG
4. **Name**: `collabdoc-backend`
5. **Publish**: Code
6. **Runtime stack**: Node 20 LTS
7. **Operating System**: Windows
8. **Region**: Southeast Asia
9. **App Service Plan**: GovBrinei-ASP
10. Click **Review + Create** → **Create**

#### Create Frontend Web App
1. Go to Azure Portal → Create a Resource → Web App
2. **Subscription**: Microsoft Azure Sponsorship
3. **Resource Group**: GovBrunei_RG
4. **Name**: `collabdoc-frontend`
5. **Publish**: Code
6. **Runtime stack**: Node 20 LTS
7. **Operating System**: Windows
8. **Region**: Southeast Asia
9. **App Service Plan**: GovBrinei-ASP
10. Click **Review + Create** → **Create**

## Step 2: Configure Web Apps

### Backend Web App Configuration
1. Go to `collabdoc-backend` → Configuration → Application Settings
2. Add these settings:
   ```
   WEBSITE_NODE_DEFAULT_VERSION = 20.17.0
   NODE_ENV = production
   PORT = 80
   STORAGE_PATH = D:\home\site\wwwroot\uploads
   TEMPLATES_PATH = D:\home\site\wwwroot\templates
   MAX_FILE_SIZE = 50mb
   ```

3. Go to Configuration → General Settings
4. Set **Startup Command**: `src/index.js`

### Frontend Web App Configuration
1. Go to `collabdoc-frontend` → Configuration → Application Settings
2. Add this setting:
   ```
   WEBSITE_NODE_DEFAULT_VERSION = 20.17.0
   ```

3. Go to Configuration → General Settings
4. Set **Default Documents**: `index.html`

## Step 3: Download Publish Profiles

### Backend Publish Profile
1. Go to `collabdoc-backend` web app
2. Click **Get publish profile** in the Overview section
3. Save the file as `backend-publish-profile.publishsettings`

### Frontend Publish Profile
1. Go to `collabdoc-frontend` web app
2. Click **Get publish profile** in the Overview section
3. Save the file as `frontend-publish-profile.publishsettings`

## Step 4: Set Up GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

### Add these secrets:

#### Publish Profiles
- **Name**: `AZURE_WEBAPP_PUBLISH_PROFILE_BACKEND`
- **Value**: Copy and paste the entire content of `backend-publish-profile.publishsettings`

- **Name**: `AZURE_WEBAPP_PUBLISH_PROFILE_FRONTEND`
- **Value**: Copy and paste the entire content of `frontend-publish-profile.publishsettings`

#### Frontend Environment Variables
- **Name**: `REACT_APP_API_BASE_URL`
- **Value**: `https://collabdoc-backend.azurewebsites.net`

- **Name**: `REACT_APP_SYNCFUSION_LICENSE_KEY`
- **Value**: Your Syncfusion license key

- **Name**: `REACT_APP_AZURE_AD_CLIENT_ID`
- **Value**: Your Azure AD client ID

- **Name**: `REACT_APP_AZURE_AD_TENANT_ID`
- **Value**: Your Azure AD tenant ID

- **Name**: `REACT_APP_AZURE_AD_REDIRECT_URI`
- **Value**: `https://collabdoc-frontend.azurewebsites.net`

## Step 5: Configure Backend Environment Variables

Go to `collabdoc-backend` → Configuration → Application Settings

Add these additional settings:
```
AZURE_AD_CLIENT_ID = your_azure_ad_client_id
AZURE_AD_TENANT_ID = your_azure_ad_tenant_id
AZURE_AD_CLIENT_SECRET = your_azure_ad_client_secret
JWT_SECRET = your_jwt_secret_key
CORS_ORIGIN = https://collabdoc-frontend.azurewebsites.net
```

## Step 6: Configure Azure AD App Registration

1. Go to Azure Portal → Azure Active Directory → App registrations
2. Find your app registration (or create a new one)
3. Go to **Authentication** → **Platform configurations**
4. Add **Single-page application** platform
5. Add redirect URI: `https://collabdoc-frontend.azurewebsites.net`
6. Add redirect URI: `https://collabdoc-frontend.azurewebsites.net/redirect` (if needed)

## Step 7: Deploy

### Option A: Automatic Deployment
1. Push your code to the main branch
2. GitHub Actions will automatically deploy both apps

### Option B: Manual Deployment
1. Go to GitHub repository → Actions
2. Select "Deploy Full Stack to Azure"
3. Click "Run workflow"
4. Select the main branch
5. Click "Run workflow"

## Step 8: Verify Deployment

### Test Backend
Visit: `https://collabdoc-backend.azurewebsites.net/health`
Expected: JSON response with status

### Test Frontend
Visit: `https://collabdoc-frontend.azurewebsites.net`
Expected: CollabDoc application loads

## Troubleshooting

### Common Issues

1. **Deployment fails**: Check publish profile format
2. **App doesn't start**: Check startup command and Node.js version
3. **CORS errors**: Verify CORS_ORIGIN setting in backend
4. **Authentication fails**: Check Azure AD configuration

### Logs
- Backend logs: `collabdoc-backend` → Monitoring → Log stream
- Frontend logs: `collabdoc-frontend` → Monitoring → Log stream

## URLs After Setup
- **Frontend**: https://collabdoc-frontend.azurewebsites.net
- **Backend**: https://collabdoc-backend.azurewebsites.net

## Files Updated
The following workflow files have been updated with your app names:
- `.github/workflows/frontend-deploy.yml`
- `.github/workflows/backend-deploy.yml`
- `.github/workflows/deploy-fullstack.yml`
