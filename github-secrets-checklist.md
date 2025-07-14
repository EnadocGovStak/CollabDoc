# GitHub Secrets Checklist for CollabDoc Deployment

## Web App Details
- **Backend Web App**: collabdoc-backend
- **Frontend Web App**: collabdoc-frontend
- **Resource Group**: GovBrunei_RG
- **App Service Plan**: GovBrinei-ASP

## Required GitHub Secrets

### Publish Profiles
- [x] AZURE_WEBAPP_PUBLISH_PROFILE_BACKEND
  - ✅ Added to GitHub Secrets
  
- [x] AZURE_WEBAPP_PUBLISH_PROFILE_FRONTEND
  - ✅ Added to GitHub Secrets

### Frontend Build Environment Variables
- [ ] REACT_APP_API_BASE_URL
  - Value: https://collabdoc-backend.azurewebsites.net
  
- [ ] REACT_APP_SYNCFUSION_LICENSE_KEY
  - Value: Your Syncfusion license key
  
- [ ] REACT_APP_AZURE_AD_CLIENT_ID
  - Value: Your Azure AD client ID
  
- [ ] REACT_APP_AZURE_AD_TENANT_ID
  - Value: Your Azure AD tenant ID
  
- [ ] REACT_APP_AZURE_AD_REDIRECT_URI
  - Value: https://collabdoc-frontend.azurewebsites.net

## Azure Web App Environment Variables

### Backend Web App (collabdoc-backend)
Add these in Azure Portal > Web App > Configuration > Application Settings:

- [ ] AZURE_AD_CLIENT_ID - Your Azure AD client ID
- [ ] AZURE_AD_TENANT_ID - Your Azure AD tenant ID  
- [ ] AZURE_AD_CLIENT_SECRET - Your Azure AD client secret
- [ ] JWT_SECRET - Your JWT secret key
- [ ] CORS_ORIGIN - https://collabdoc-frontend.azurewebsites.net

### Frontend Web App (collabdoc-frontend)
No additional environment variables needed - configured through GitHub build process.

## Deployment URLs
- **Frontend**: https://collabdoc-frontend.azurewebsites.net
- **Backend**: https://collabdoc-backend.azurewebsites.net

## Next Steps
1. Copy publish profile contents to GitHub secrets
2. Add all environment variables to GitHub secrets
3. Configure Azure AD app registration with correct redirect URIs
4. Set backend environment variables in Azure Portal
5. Run the deployment workflow from GitHub Actions
