# 🚨 CORS Fix Required

## Issue
Your frontend is getting blocked by CORS policy when trying to access the backend API.

## Solution Applied
1. ✅ Updated backend CORS configuration to allow frontend domain
2. ⏳ Need to set environment variable in Azure

## Next Steps

### Step 1: Set Environment Variable in Azure Portal
1. Go to **Azure Portal**
2. Navigate to **collabdoc-backend** web app
3. Go to **Configuration** → **Application Settings**
4. Add this environment variable:
   ```
   Name: CORS_ORIGIN
   Value: https://collabdoc-frontend.azurewebsites.net
   ```
5. Click **Save**
6. **Restart** the backend app

### Step 2: Deploy Updated Backend
Run these commands to deploy the CORS fix:

```bash
git add .
git commit -m "Fix CORS configuration for production frontend"
git push origin main
```

## Expected Result
After these changes:
- ✅ CORS errors should disappear
- ✅ Frontend should be able to fetch documents from backend
- ✅ API calls should work properly

## Alternative Quick Fix
If you want to test immediately, you can also set CORS to allow all origins temporarily by adding this environment variable in Azure:
```
CORS_ORIGIN=*
```
But for security, use the specific frontend URL as shown above.

## Verification
After the fix, the documents should load without the network errors you're seeing in the console.
