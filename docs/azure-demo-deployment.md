# Azure Demo Deployment

This repository is configured to deploy the React frontend and Node backend together to a single Azure App Service named `collabdocweb`.

## What the workflow does

- Builds the frontend from the repo root.
- Copies the built frontend into `backend/public` through the root `npm run build` script.
- Packages the backend for deployment.
- Configures the Azure Web App with production settings.
- Deploys the backend package to Azure App Service.

## GitHub secrets required

The workflow expects these GitHub repository secrets:

- `AZUREAPPSERVICE_CLIENTID_082CE0ACB88148CAB2EEA75FA40B5C25`
- `AZUREAPPSERVICE_TENANTID_78A8038E871C4FDEAB89BE437679D6DF`
- `AZUREAPPSERVICE_SUBSCRIPTIONID_76E14732AEB64CEA975F947A3019625D`

## Azure Web App settings applied by the workflow

- `SCM_DO_BUILD_DURING_DEPLOYMENT=true`
- `NODE_ENV=production`
- `STORAGE_ROOT=/home/site/data/collabdoc`

The workflow also sets the Linux startup command to `npm start`.

## Azure portal app settings to add manually

Add these in the Azure Web App Configuration blade when you are ready to use them:

- `AZURE_STORAGE_CONNECTION_STRING`
- `REACT_APP_SYNCFUSION_LICENSE_KEY`
- `REACT_APP_AZURE_AD_CLIENT_ID` if using sign-in
- `REACT_APP_AZURE_AD_TENANT_ID` if using sign-in

## Storage behavior

The backend now supports configurable storage paths. On Azure App Service, it will use `STORAGE_ROOT=/home/site/data/collabdoc` unless a more specific directory override is provided.

This means templates and uploads are no longer tied to the repo folder layout during deployment.

Current directory mapping:

- templates: `STORAGE_ROOT/templates`
- uploads: `STORAGE_ROOT/uploads`
- documents: `STORAGE_ROOT/uploads/documents`
- versions: `STORAGE_ROOT/uploads/versions`
- temp uploads: `STORAGE_ROOT/uploads/temp`

## Important note about the storage account

The application still reads and writes files through the file system API. For this demo deployment, persistent data is handled through the App Service storage path under `/home/site/data/collabdoc`.

If you want the app to write directly to Azure Blob Storage, that requires a separate application change to replace the current file-system based template and document storage.