/**
 * Application configuration 
 * This file provides application-wide configuration and should be used instead of
 * accessing process.env directly to ensure type safety and easier maintenance.
 */

export interface Config {
  syncfusion: {
    licenseKey: string;
  };
  azureAd: {
    clientId: string;
    tenantId: string;
    redirectUri: string;
  };
  api: {
    baseUrl: string;
  };
}

const config: Config = {
  syncfusion: {
    licenseKey: process.env.REACT_APP_SYNCFUSION_LICENSE_KEY || '',
  },
  azureAd: {
    clientId: process.env.REACT_APP_AZURE_AD_CLIENT_ID || '',
    tenantId: process.env.REACT_APP_AZURE_AD_TENANT_ID || '',
    redirectUri: `${window.location.origin}/`,
  },
  api: {
    baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001',
  },
};

export default config; 