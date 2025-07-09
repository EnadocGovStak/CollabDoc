# Collaborative Document Platform - Frontend

## Quick Start Guide

This guide provides instructions for setting up and running the frontend part of the Collaborative Document Platform.

### Prerequisites
- Node.js 16.x or higher
- npm 8.x or higher
- Backend server running (see backend/README.md)

### Setup and Installation

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Set up environment variables**
   - Copy .env.example to .env if it doesn't exist
   - Add your Syncfusion license key to .env

3. **Start the development server**
   ```bash
   npm start
   ```
   The server will start on port 3000 by default.

### IMPORTANT: Running the Full Application

1. **Start order matters**:
   - Start the backend server FIRST: `cd ../backend && npm start`
   - Start the frontend server SECOND: `cd frontend && npm start`
   - Both servers must be running concurrently

2. **Port conflicts**:
   If you have port conflicts (usually on port 3000), you can:
   ```bash
   # Kill all Node.js processes (Windows)
   taskkill /f /im node.exe
   
   # Or specify a different port
   set PORT=3001 && npm start
   ```

3. **Testing the Editor**:
   - Visit the "Editor Test" page to validate editor components
   - Both the basic editor and container editor should load without errors

### Troubleshooting Common Issues

1. **Editor errors in console**:
   - Check that Syncfusion license key is properly registered
   - Ensure all dependencies are installed correctly
   - Verify that backend API services are running

2. **Page doesn't load**:
   - Check browser console for JavaScript errors
   - Verify that the correct ports are being used
   - Make sure no firewall is blocking the connections

3. **Editor doesn't show document content**:
   - Confirm that backend server is running and accessible
   - Check network tab for API request errors
   - Ensure document ID is valid

For more detailed documentation, see the main README.md file in the project root.
