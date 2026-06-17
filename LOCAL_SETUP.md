# Local Development Setup Guide

This guide helps you set up your local environment to match the CI/CD pipeline requirements.

## Prerequisites

- Node.js v22 or higher
- npm 10 or higher
- Git

## Initial Setup

### 1. Install Dependencies
```bash
npm ci  # Use 'ci' instead of 'install' for reproducible builds
```

### 2. Install Git Hooks (Optional but Recommended)
```bash
npm install --save-dev husky lint-staged
npx husky install
```

### 3. Configure Husky
```bash
npx husky add .husky/pre-commit "npx lint-staged"
npx husky add .husky/commit-msg "echo 'Validating commit message...'"
```

## Update package.json

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "test:ci": "react-scripts test --watchAll=false --coverage",
    "lint": "eslint src/ --ext .js,.jsx",
    "lint:fix": "eslint src/ --ext .js,.jsx --fix",
    "format": "prettier --write \"src/**/*.{js,jsx,css,md}\"",
    "format:check": "prettier --check \"src/**/*.{js,jsx,css,md}\"",
    "eject": "react-scripts eject",
    "prepare": "husky install"
  },
  "devDependencies": {
    "eslint": "^8.57.0",
    "eslint-config-react-app": "^7.0.1",
    "husky": "^9.0.11",
    "lint-staged": "^15.2.2",
    "prettier": "^3.2.5"
  }
}
```

## Add lint-staged Configuration

Create `.lintstagedrc.json`:

```json
{
  "src/**/*.{js,jsx}": ["eslint --fix", "prettier --write"],
  "src/**/*.{css,md}": ["prettier --write"]
}
```

Or add to `package.json`:

```json
{
  "lint-staged": {
    "src/**/*.{js,jsx}": ["eslint --fix", "prettier --write"],
    "src/**/*.{css,md}": ["prettier --write"]
  }
}
```

## Add ESLint Configuration

Create `.eslintrc.json`:

```json
{
  "extends": ["react-app", "react-app/jest"],
  "rules": {
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
    "eqeqeq": ["warn", "always"],
    "no-var": "error"
  }
}
```

## Add Prettier Configuration

Create `.prettierrc.json`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always"
}
```

Create `.prettierignore`:

```
build
dist
node_modules
coverage
*.log
.DS_Store
```

## Common Commands

### Development
```bash
# Start development server
npm start

# Run tests in watch mode
npm test

# Run linter
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format code
npm run format

# Check formatting without changes
npm run format:check
```

### Before Committing
```bash
# Run the same tests as CI
npm run test:ci

# Build for production (same as CI)
npm run build

# Lint and format everything
npm run lint:fix && npm run format
```

### CI/CD Simulation
```bash
# Run the complete CI pipeline locally
npm ci
npm run lint
npm run test:ci
npm run build
```

## Troubleshooting

### Husky not running hooks
```bash
# Reinstall husky
npm install --save-dev husky
npx husky install
```

### Cache issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm ci
```

### Tests failing locally but not in CI
```bash
# Run tests in CI mode
npm run test:ci

# Check for environment variables
env | grep NODE
```

### ESLint errors
```bash
# Show all errors
npm run lint

# Try auto-fix
npm run lint:fix

# Clear cache if issues persist
npx eslint --cache --cache-location=./node_modules/.eslintcache src/ --fix
```

## Branch Protection Rules

Recommended GitHub settings under Settings > Branches > Branch protection rules:

1. **Require status checks to pass before merging**
   - Require branches to be up to date before merging
   - Require the following status checks:
     - lint
     - test
     - build

2. **Require code reviews**
   - Require pull request reviews: 1
   - Dismiss stale pull request approvals

3. **Other restrictions**
   - Require conversation resolution before merging
   - Require commits to be signed

## Environment Variables

If your app uses environment variables:

### Local Development
Create `.env.local`:
```
REACT_APP_API_URL=http://localhost:3001
```

### Production Build
Add to `.env.production`:
```
REACT_APP_API_URL=https://api.example.com
```

Note: Only variables prefixed with `REACT_APP_` are exposed to the client.

## CI/CD Pipeline Status

Check pipeline status:
- GitHub Actions: Go to your repository > Actions tab
- View detailed logs: Click on workflow run > Select job
- Download artifacts: Click on workflow run > Download artifact

## Getting Help

### Local Issues
- Check Node version: `node --version`
- Check npm version: `npm --version`
- Clear cache and reinstall: `npm ci --no-cache`

### CI/CD Issues
- Review GitHub Actions logs
- Run `npm run test:ci` locally to reproduce
- Check for environment-specific issues

### Documentation
- React Documentation: https://react.dev
- GitHub Actions: https://docs.github.com/en/actions
- ESLint: https://eslint.org
- Prettier: https://prettier.io

