# Web Smoke Tests

This directory contains smoke tests for the Cloned web application.

## Overview

These tests verify that core pages render without crashing. They are intentionally minimal and focus on:
- Page rendering without errors
- Critical UI elements are present
- Basic navigation works

## Setup Required

To run these tests, you need to install testing dependencies:

```bash
cd apps/web
pnpm add -D @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom @testing-library/user-event
```

You'll also need to create a `jest.config.js`:

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}

module.exports = createJestConfig(customJestConfig)
```

And a `jest.setup.js`:

```javascript
import '@testing-library/jest-dom'
```

Add to `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

## Test Coverage Areas

### 1. Home Page (`page.test.tsx`)
- Renders without crashing
- Shows logo and branding
- Shows auth navigation (login/register)
- Shows guest access option

### 2. Auth Pages (`auth/*.test.tsx`)
- Login page renders
- Register page renders
- Guest page renders
- Forms have proper inputs

### 3. Dashboard Page (`dashboard/*.test.tsx`)
- Protected route behavior
- Shows profile list
- Shows create profile button

## Running Tests

```bash
# Run all tests
pnpm test

# Run in watch mode
pnpm test:watch

# Run with coverage
pnpm test -- --coverage
```

## Notes

- These are **smoke tests**, not comprehensive unit tests
- They verify basic rendering, not complex interactions
- Real integration testing should be done with e2e tools like Playwright or Cypress
- Tests should be fast and focused

## Example Test Files

See the example test files in this directory for reference implementations.
