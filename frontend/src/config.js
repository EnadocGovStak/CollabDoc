/**
 * Application configuration 
 * This file provides application-wide configuration and should be used instead of
 * accessing process.env directly to ensure easier maintenance.
 */

const config = {
  syncfusion: {
    // Using provided Syncfusion license key
    licenseKey: process.env.REACT_APP_SYNCFUSION_LICENSE_KEY || 'Ngo9BigBOggjHTQxAR8/V1NGaF1cXGFCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdmWXpeeXVXRGFZUk1zXUJWYUs=',
  },
  azureAd: {
    clientId: process.env.REACT_APP_AZURE_AD_CLIENT_ID || '',
    tenantId: process.env.REACT_APP_AZURE_AD_TENANT_ID || '',
    redirectUri: `${window.location.origin}/`,
  },
  api: {
    baseUrl: process.env.REACT_APP_API_BASE_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000'),
  },
};

export default config; 