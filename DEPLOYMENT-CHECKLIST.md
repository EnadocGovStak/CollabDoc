# CollabDoc Azure Deployment Checklist

## Pre-Deployment Setup

### 1. Azure Resources
- [ ] Create Backend Azure Web App (Node.js 18.x)
- [ ] Create Frontend Azure Web App (Node.js 18.x or Static Web App)
- [ ] Download publish profiles for both apps
- [ ] Configure Azure AD app registration
- [ ] Set up storage accounts (if using Azure Blob Storage)

### 2. GitHub Repository Setup
- [ ] Fork/clone the CollabDoc repository
- [ ] Run setup script: `.\scripts\setup-deployment.ps1` (Windows) or `./scripts/setup-deployment.sh` (Linux/Mac)
- [ ] Update workflow files with your app names

### 3. GitHub Secrets Configuration
- [ ] Add `AZURE_WEBAPP_PUBLISH_PROFILE_BACKEND`
- [ ] Add `AZURE_WEBAPP_PUBLISH_PROFILE_FRONTEND`
- [ ] Add `REACT_APP_API_BASE_URL`
- [ ] Add `REACT_APP_SYNCFUSION_LICENSE_KEY`
- [ ] Add `REACT_APP_AZURE_AD_CLIENT_ID`
- [ ] Add `REACT_APP_AZURE_AD_TENANT_ID`
- [ ] Add `REACT_APP_AZURE_AD_REDIRECT_URI`

### 4. Azure Web App Configuration

#### Backend Environment Variables
- [ ] `NODE_ENV=production`
- [ ] `PORT=80`
- [ ] `AZURE_AD_CLIENT_ID`
- [ ] `AZURE_AD_TENANT_ID`
- [ ] `AZURE_AD_CLIENT_SECRET`
- [ ] `STORAGE_PATH=D:\home\site\wwwroot\uploads`
- [ ] `TEMPLATES_PATH=D:\home\site\wwwroot\templates`
- [ ] `JWT_SECRET`
- [ ] `CORS_ORIGIN` (frontend URL)

#### Frontend Configuration
- [ ] Runtime: Node.js 18.x
- [ ] Default document: `index.html`
- [ ] URL rewrite enabled (handled by web.config)

## Deployment Process

### 1. Initial Deployment
- [ ] Push code to main branch OR
- [ ] Manually trigger "Deploy Full Stack to Azure" workflow
- [ ] Monitor GitHub Actions for build and deployment status
- [ ] Check Azure Web App logs for any errors

### 2. Verify Deployment
- [ ] Test backend health endpoint: `https://your-backend-app.azurewebsites.net/health`
- [ ] Test frontend loading: `https://your-frontend-app.azurewebsites.net`
- [ ] Test document creation and editing
- [ ] Test template functionality
- [ ] Test authentication flow

### 3. Post-Deployment Configuration
- [ ] Configure custom domains (if needed)
- [ ] Set up SSL certificates
- [ ] Configure Application Insights for monitoring
- [ ] Set up backup strategies
- [ ] Configure logging levels

## Troubleshooting

### Common Issues Checklist
- [ ] Check all GitHub secrets are properly set
- [ ] Verify Azure Web Apps are running
- [ ] Check environment variables in Azure Web Apps
- [ ] Review GitHub Actions logs
- [ ] Check Azure Web App logs
- [ ] Verify CORS configuration
- [ ] Test authentication endpoints

### Performance Optimization
- [ ] Enable Application Insights
- [ ] Configure caching headers
- [ ] Enable compression
- [ ] Set up CDN (if needed)
- [ ] Configure auto-scaling

## Maintenance

### Regular Tasks
- [ ] Monitor application performance
- [ ] Update dependencies regularly
- [ ] Review security settings
- [ ] Backup application data
- [ ] Update documentation

### Scaling Considerations
- [ ] Move to Azure SQL Database for production
- [ ] Implement Azure Blob Storage for file uploads
- [ ] Set up Azure Redis Cache
- [ ] Configure load balancing
- [ ] Implement monitoring and alerting

## Security Checklist

### Production Security
- [ ] Use HTTPS only
- [ ] Configure proper CORS settings
- [ ] Implement rate limiting
- [ ] Use Azure Key Vault for secrets
- [ ] Enable Azure Web App Authentication
- [ ] Configure network security groups
- [ ] Regular security audits

### Data Protection
- [ ] Implement data encryption at rest
- [ ] Configure backup retention policies
- [ ] Set up disaster recovery
- [ ] Implement data classification
- [ ] Configure access controls

## Resources

- 📖 [Deployment Guide](docs/deployment.md)
- 🔧 [Setup Script](scripts/setup-deployment.ps1)
- 📋 [GitHub Secrets Checklist](github-secrets-checklist.md)
- 🧪 [Test Script](scripts/test-deployment.ps1)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review GitHub Actions logs
3. Check Azure Web App logs
4. Consult the deployment documentation
5. Contact your system administrator
