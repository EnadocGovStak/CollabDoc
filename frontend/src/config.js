/**
 * Application configuration 
 * This file provides application-wide configuration and should be used instead of
 * accessing process.env directly to ensure easier maintenance.
 */

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');

const config = {
  syncfusion: {
    licenseKey: process.env.REACT_APP_SYNCFUSION_LICENSE_KEY || process.env.REACT_APP_SYNCFUSION_KEY || '',
  },
  azureAd: {
    clientId: process.env.REACT_APP_AZURE_AD_CLIENT_ID || '',
    tenantId: process.env.REACT_APP_AZURE_AD_TENANT_ID || '',
    redirectUri: `${window.location.origin}/`,
  },
  identity: {
    provider: process.env.REACT_APP_AUTH_PROVIDER || 'mock',
    authority: process.env.REACT_APP_SFLOW_AUTHORITY || 'https://sflow-kong.salmonwave-4030412c.southeastasia.azurecontainerapps.io/identity',
    clientId: process.env.REACT_APP_SFLOW_CLIENT_ID || 'collabdoc-ui-spa',
    scope: process.env.REACT_APP_SFLOW_SCOPE || 'openid profile email roles offline_access govstack.workflow',
    redirectUri: process.env.REACT_APP_SFLOW_REDIRECT_URI || `${window.location.origin}/auth/callback`,
    metadataProxyUrl: process.env.REACT_APP_SFLOW_METADATA_PROXY_URL || `${apiBaseUrl}/api/auth/sflow/metadata`,
    tokenProxyUrl: process.env.REACT_APP_SFLOW_TOKEN_PROXY_URL || `${apiBaseUrl}/api/auth/sflow/token`
  },
  api: {
    baseUrl: apiBaseUrl,
  },
};

export default config; 