# Testing Documentation

This document describes the testing strategy and implementation for the Collaborative Document Platform.

## Testing Philosophy

Our testing approach follows the testing pyramid:

1. **Unit Tests** (Base): Many small tests covering individual components and functions
2. **Integration Tests** (Middle): Medium number of tests covering interactions between components
3. **End-to-End Tests** (Top): Few tests covering critical user workflows

## Test Types

### Unit Tests

Unit tests verify that individual components or functions work correctly in isolation.

#### Frontend Unit Tests

- Located in: `frontend/src/tests/unit/`
- Uses: Jest + React Testing Library
- Mocks: External dependencies are mocked (API calls, contexts, etc.)
- Example: Testing a React component renders correctly with different props

#### Backend Unit Tests

- Located in: `backend/tests/unit/`
- Uses: Jest
- Mocks: File system, external services, databases
- Example: Testing a service function with mocked dependencies

### Integration Tests

Integration tests verify that multiple components or services work together correctly.

#### Frontend Integration Tests

- Located in: `frontend/src/tests/integration/`
- Uses: Jest + React Testing Library
- Tests: Service modules, component interactions
- Example: Testing that a service correctly interacts with the API

#### Backend Integration Tests

- Located in: `backend/tests/integration/`
- Uses: Jest + Supertest
- Tests: API endpoints, controller-service interactions
- Example: Testing that an API endpoint correctly processes requests

### End-to-End Tests

E2E tests verify complete user workflows from frontend to backend.

- Located in: `backend/tests/e2e/`
- Uses: Jest + Axios
- Requires: Running backend server
- Tests: Complete user workflows across the entire system
- Example: Testing template creation, document generation, and submission workflow

## Running Tests

### Frontend Tests

```bash
# Run all tests in watch mode
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run all tests with coverage report
npm run test:coverage
```

### Backend Tests

```bash
# Run all tests
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run only end-to-end tests
npm run test:e2e

# Run all tests with coverage report
npm run test:coverage
```

## Test Configuration

### Frontend Jest Configuration

Jest configuration is defined in `frontend/package.json`:

```json
"jest": {
  "collectCoverageFrom": [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/index.tsx",
    "!src/reportWebVitals.ts"
  ],
  "coverageThreshold": {
    "global": {
      "statements": 50,
      "branches": 50,
      "functions": 50,
      "lines": 50
    }
  }
}
```

### Backend Jest Configuration

Jest configuration is defined in `backend/package.json`:

```json
"jest": {
  "testEnvironment": "node",
  "collectCoverageFrom": [
    "src/**/*.js",
    "!src/index.js"
  ],
  "coverageThreshold": {
    "global": {
      "statements": 50,
      "branches": 50,
      "functions": 50,
      "lines": 50
    }
  },
  "testTimeout": 10000
}
```

## Mocking

### Frontend Mocking

- **Services**: Mock API calls using Jest's `jest.mock()` for service functions
- **Auth Context**: Mock authentication context for components that require auth
- **External Libraries**: Mock Syncfusion components for reliable component testing

### Backend Mocking

- **File System**: Mock `fs` module for template service testing
- **Authentication**: Mock auth middleware for testing protected endpoints
- **External Services**: Mock any external API calls

## E2E Test Environment

End-to-end tests require additional setup:

1. Environment variables in `.env` for E2E tests:
   ```
   API_URL=http://localhost:5000
   TEST_ACCESS_TOKEN=your-test-token
   ```

2. Running backend server during tests or a proper CI setup

## Best Practices

1. **Isolation**: Unit tests should be isolated and not depend on external services
2. **Coverage**: Aim for high test coverage, especially for critical components
3. **Readability**: Use descriptive test names and arrange-act-assert pattern
4. **Maintainability**: Keep tests simple and focused on one aspect
5. **Performance**: Keep tests fast, especially unit tests
6. **CI Integration**: Tests should run automatically on pull requests

## CI/CD Integration

When setting up CI/CD, configure:

1. Running tests on every pull request
2. Generating and publishing coverage reports
3. Failing builds when tests fail or coverage drops below thresholds
4. Separating E2E tests to run less frequently

## Continuous Improvement

Regularly review and improve tests:

1. Add tests for new features and bug fixes
2. Refactor flaky tests to make them more reliable
3. Update mocks when implementations change
4. Increase coverage thresholds gradually 