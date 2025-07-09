# Collaborative Document Platform - Ba   # If you have port conflicts (usually on port 5000), you can:
   ```bash
   # Kill all Node.js processes (Windows)
   taskkill /f /im node.exe
   
   # Or specify a different port in .env
   PORT=5001
   ```
## Quick Start Guide

This guide provides instructions for setting up and running the backend API server for the Collaborative Document Platform.

### Prerequisites
- Node.js 16.x or higher
- npm 8.x or higher
- MongoDB (local or cloud instance)

### Setup and Installation

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables**
   - Copy .env.example to .env if it doesn't exist
   - Configure database connection string
   - Set JWT secret for authentication

3. **Start the development server**
   ```bash
   npm start
   ```
   The server will start on port 5000 by default.

### IMPORTANT: Running the Full Application

1. **Start order matters**:
   - Start the backend server FIRST: `cd backend && npm start`
   - Wait until you see "Server running on port 5000" and "Connected to database"
   - Then start the frontend server: `cd ../frontend && npm start`

2. **Port conflicts**:
   If you have port conflicts (usually on port 5000), you can:
   ```bash
   # Kill all Node.js processes (Windows)
   taskkill /f /im node.exe
   
   # Or specify a different port in .env
   PORT=5001
   ```

3. **Testing the API**:
   - The API will be available at http://localhost:5000
   - You can test endpoints with tools like Postman or curl
   - Sample requests are available in the docs/api-spec.md file

### Troubleshooting Common Issues

1. **Database connection errors**:
   - Verify MongoDB is running and accessible
   - Check that connection string in .env is correct
   - Ensure network allows connections to database

2. **API not responding**:
   - Check console for error messages
   - Verify correct port is being used
   - Ensure no firewall is blocking connections

3. **Authentication issues**:
   - Verify JWT secret is properly set
   - Check token expiration settings
   - Ensure user credentials are valid

For more detailed documentation, see the main README.md file in the project root.
