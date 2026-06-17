# CI/CD Pipeline Documentation

This document explains the automated CI/CD pipeline for the cdviz-demo React application.

## Pipeline Overview

The pipeline is triggered on:
- **Push** to `main` or `develop` branches
- **Pull requests** to `main` or `develop` branches

## Workflow Jobs

### 1. **Lint Job**
- **Purpose**: Check code quality and style consistency
- **Steps**:
  - Checkout repository
  - Setup Node.js v22 (with npm cache)
  - Install dependencies
  - Run ESLint checks
- **Status**: Runs in parallel with tests, but build waits for this
- **Note**: Currently configured to not fail if ESLint is not set up

### 2. **Test Job**
- **Purpose**: Run unit tests and generate coverage reports
- **Steps**:
  - Checkout repository
  - Setup Node.js v22 (with npm cache)
  - Install dependencies
  - Run Jest tests with coverage
  - Upload coverage to Codecov (optional)
- **Status**: Required before build

### 3. **Build Job**
- **Purpose**: Compile the React application for production
- **Steps**:
  - Checkout repository
  - Setup Node.js v22 (with npm cache)
  - Install dependencies
  - Build optimized production bundle
  - Upload build artifacts (retained for 5 days)
- **Dependencies**: Requires lint and test jobs to pass
- **Artifacts**: Build output uploaded for deployment

### 4. **Deploy Job**
- **Purpose**: Deploy the built application to GitHub Pages
- **Trigger**: Only runs on successful push to `main` branch
- **Steps**:
  - Download build artifacts
  - Deploy to GitHub Pages using peaceiris/actions-gh-pages
  - Confirm deployment status
- **Dependencies**: Requires build job to succeed

## Environment Variables

- `NODE_VERSION`: Set to `22` (used across all jobs for consistency)

## Caching Strategy

The pipeline uses npm caching at the `setup-node` step to:
- Cache dependencies from `package-lock.json`
- Speed up subsequent runs significantly
- Reduce bandwidth and CI minutes

## Artifacts

- **Build Artifact**: Retained for 5 days
- **Location**: `build/` directory
- **Used by**: Deploy job

## Deployment

### GitHub Pages Deployment
The pipeline automatically deploys to GitHub Pages when:
- Code is pushed to the `main` branch
- All previous jobs succeed

**Setup Required**:
```bash
# Ensure package.json has the "homepage" field:
"homepage": "https://yourusername.github.io/cdviz-demo"
```

## Adding More Deployment Options

### AWS S3 Deployment
```yaml
- name: Deploy to S3
  uses: jakejarvis/s3-sync-action@master
  with:
    args: --acl public-read --follow-symlinks --delete
  env:
    AWS_S3_BUCKET: ${{ secrets.AWS_S3_BUCKET }}
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    AWS_REGION: 'us-east-1'
    SOURCE_DIR: 'build'
```

### Netlify Deployment
```yaml
- name: Deploy to Netlify
  uses: netlify/actions/cli@master
  with:
    args: deploy --prod --dir=build
  env:
    NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
    NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## Recommended Enhancements

### 1. Add ESLint to package.json
```json
{
  "scripts": {
    "lint": "eslint src/ --ext .js,.jsx"
  },
  "devDependencies": {
    "eslint": "^8.x",
    "eslint-config-react-app": "^7.x"
  }
}
```

### 2. Add Pre-commit Hooks
Install `husky` and `lint-staged` for local checks:
```bash
npm install --save-dev husky lint-staged
npx husky install
```

### 3. Monitor Performance
- Track build times
- Monitor artifact sizes
- Review codecov reports for coverage trends

### 4. Add Status Badges
Add to your README.md:
```markdown
![React CI/CD](https://github.com/yourname/cdviz-demo/workflows/React%20CI%2FCD%20Pipeline/badge.svg)
```

## Troubleshooting

### Build fails with dependency issues
- Clear the cache and retry
- Update `package-lock.json`
- Check for version conflicts

### Tests fail unexpectedly
- Run `npm test` locally first
- Check for environment-specific issues
- Review test output in GitHub Actions logs

### Deployment fails
- Verify GitHub Pages is enabled in settings
- Check branch protection rules
- Ensure `homepage` field is set in package.json

## Security

- Uses `GITHUB_TOKEN` (automatically provided by GitHub)
- Sensitive data stored in repository Secrets
- For external deployments, add secrets in Settings > Secrets and variables

