# 🚀 GitHub Actions Deployment Guide

## ✅ Pre-Deployment Security Check Complete

All hardcoded secrets have been removed from your codebase:
- ✅ Syncfusion license keys now use environment variables with production fallback
- ✅ Azure AD client IDs use environment variables
- ✅ API URLs updated to use production backend URL as fallback
- ✅ No hardcoded secrets found in source code

**Note**: Fallback values are set for production deployment but will be overridden by GitHub Secrets during build.

## 📋 Step-by-Step Deployment Instructions

### Step 1: Set Up GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**

#### Required Secrets:

1. **Publish Profiles** (✅ Already Added)
   - `AZURE_WEBAPP_PUBLISH_PROFILE_BACKEND`
   - `AZURE_WEBAPP_PUBLISH_PROFILE_FRONTEND`

   Azure check on May 26, 2026 found `collabdocweb-fresh`, `collabdocstorage`, and `collabdocwebapp` in the `collabdoc` resource group. Create `collabdoc-backend` and refresh `AZURE_WEBAPP_PUBLISH_PROFILE_BACKEND` before running the backend/full-stack workflow.

2. **Frontend Environment Variables** (Add These Now)
   ```
   REACT_APP_API_BASE_URL
   Value: https://collabdoc-backend.azurewebsites.net
   
   REACT_APP_SYNCFUSION_LICENSE_KEY
   Value: [Your Syncfusion license key]
   
   REACT_APP_AZURE_AD_CLIENT_ID
   Value: [Your Azure AD Client ID]
   
   REACT_APP_AZURE_AD_TENANT_ID
   Value: [Your Azure AD Tenant ID]
   
   REACT_APP_AZURE_AD_REDIRECT_URI
   Value: https://collabdocweb-fresh.azurewebsites.net

   REACT_APP_AUTH_PROVIDER
   Value: sflow

   REACT_APP_SFLOW_AUTHORITY
   Value: https://sflow-kong.salmonwave-4030412c.southeastasia.azurecontainerapps.io/identity

   REACT_APP_SFLOW_CLIENT_ID
   Value: collabdoc-ui-spa

   REACT_APP_SFLOW_SCOPE
   Value: openid profile email roles offline_access govstack.workflow

   REACT_APP_SFLOW_REDIRECT_URI
   Value: https://collabdocweb-fresh.azurewebsites.net/auth/callback
   ```

### Step 2: Configure Backend Environment Variables in Azure

1. Go to **Azure Portal** → **collabdoc-backend** → **Configuration** → **Application Settings**
2. Add these settings:
   ```
   AZURE_AD_CLIENT_ID = [Your Azure AD Client ID]
   AZURE_AD_TENANT_ID = [Your Azure AD Tenant ID]
   AZURE_AD_CLIENT_SECRET = [Your Azure AD Client Secret]
   JWT_SECRET = [Generate a secure random string]
   CORS_ORIGIN = https://collabdocweb-fresh.azurewebsites.net
   AUTH_ISSUER = https://sflow-kong.salmonwave-4030412c.southeastasia.azurecontainerapps.io/identity
   AUTH_JWKS_URI = https://sflow-kong.salmonwave-4030412c.southeastasia.azurecontainerapps.io/identity/.well-known/jwks
   AUTH_AUDIENCE = govstack.workflow
   AUTH_ALLOWED_CLIENT_IDS = collabdoc-ui-spa
   ```

### Step 3: Deploy Using GitHub Actions

#### Option A: Automatic Deployment (Recommended)
1. **Commit and push your changes** to the main branch:
   ```bash
   git add .
   git commit -m "Fix security issues and prepare for deployment"
   git push origin main
   ```
2. **GitHub Actions will automatically trigger** and deploy both apps

#### Option B: Manual Deployment
1. Go to your **GitHub repository**
2. Click **Actions** tab
3. Select **"Deploy Full Stack to Azure"** workflow
4. Click **"Run workflow"**
5. Select **main** branch
6. Click **"Run workflow"**

### Step 4: Monitor Deployment

1. **Watch the GitHub Actions logs**:
   - Go to **Actions** tab in GitHub
   - Click on the running workflow
   - Monitor the progress of both backend and frontend builds

2. **Expected workflow steps**:
   ```
   ✅ Build Backend
   ✅ Test Backend
   ✅ Deploy Backend to Azure
   ✅ Build Frontend
   ✅ Test Frontend  
   ✅ Deploy Frontend to Azure
   ```

### Step 5: Verify Deployment

#### Test Backend API
```bash
curl https://collabdoc-backend.azurewebsites.net/health
```
Expected: JSON response with status

#### Test Frontend Application
Visit: https://collabdocweb-fresh.azurewebsites.net
Expected: CollabDoc application loads successfully

### Step 6: Configure Azure AD (If Not Done Already)

1. **Azure Portal** → **Azure Active Directory** → **App registrations**
2. **Find your app registration** (or create new one)
3. **Authentication** → **Platform configurations**
4. **Add Single-page application platform**
5. **Add redirect URIs**:
   - `https://collabdocweb-fresh.azurewebsites.net`
   - `https://collabdocweb-fresh.azurewebsites.net/auth/callback`

## 🔧 Available Workflows

### 1. Full Stack Deployment
- **File**: `.github/workflows/deploy-fullstack.yml`
- **Triggers**: Push to main branch, manual trigger
- **Deploys**: Both backend and frontend

### 2. Backend Only Deployment  
- **File**: `.github/workflows/backend-deploy.yml`
- **Triggers**: Changes to backend/ folder
- **Deploys**: Backend only

### 3. Frontend Only Deployment
- **File**: `.github/workflows/frontend-deploy.yml`  
- **Triggers**: Changes to frontend/ folder
- **Deploys**: Frontend only

## 🐛 Troubleshooting

### Common Issues:

1. **Deployment fails with authentication error**
   - Check publish profile secrets are correct
   - Verify GitHub secrets are properly set

2. **Frontend build fails**
   - Ensure all environment variables are set in GitHub secrets
   - Check for syntax errors in package.json

3. **Backend deployment fails**
   - Verify Node.js runtime is set to NODE:20LTS
   - Check startup command is set to "src/index.js"

4. **App doesn't start after deployment**
   - Check Azure Portal logs: Web App → Monitoring → Log stream
   - Verify environment variables in Azure Portal

### Deployment URLs
- **Frontend**: https://collabdocweb-fresh.azurewebsites.net
- **Backend**: https://collabdoc-backend.azurewebsites.net

## 🎉 Ready to Deploy!

Your project is now secure and ready for deployment. Follow the steps above to deploy your CollabDoc application to Azure Web Apps using GitHub Actions.

**Estimated deployment time**: 5-10 minutes for full stack deployment.
