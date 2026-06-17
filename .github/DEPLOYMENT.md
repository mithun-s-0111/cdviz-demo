# Deployment Strategies & Configurations

This file contains deployment configuration examples you can use with the CI/CD pipeline.

## Table of Contents
1. [GitHub Pages](#github-pages) (Current Default)
2. [AWS S3 + CloudFront](#aws-s3--cloudfront)
3. [Netlify](#netlify)
4. [Vercel](#vercel)
5. [Docker + Container Registry](#docker--container-registry)

---

## GitHub Pages

### Current Configuration
Already implemented in `ci.yml`. Deploys to GitHub Pages automatically.

### Setup
1. Go to repository Settings > Pages
2. Set Source to "GitHub Actions"
3. Add to `package.json`:
```json
{
  "homepage": "https://yourusername.github.io/cdviz-demo"
}
```

### Advantages
- Free hosting
- Integrated with GitHub
- No additional secrets needed

---

## AWS S3 + CloudFront

### Configuration for ci.yml
Replace the deploy job with:

```yaml
  deploy:
    name: Deploy to AWS
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    
    steps:
      - name: Download build artifact
        uses: actions/download-artifact@v4
        with:
          name: build-artifact
          path: build/

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

      - name: Invalidate CloudFront
        uses: chetan/invalidate-cloudfront-action@master
        env:
          DISTRIBUTION: ${{ secrets.AWS_CLOUDFRONT_DISTRIBUTION_ID }}
          PATHS: '/*'
          AWS_REGION: 'us-east-1'
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

### GitHub Secrets Required
- `AWS_S3_BUCKET`: Your S3 bucket name
- `AWS_ACCESS_KEY_ID`: AWS IAM user access key
- `AWS_SECRET_ACCESS_KEY`: AWS IAM user secret key
- `AWS_CLOUDFRONT_DISTRIBUTION_ID`: CloudFront distribution ID (optional)

### Advantages
- Highly scalable
- CDN integration with CloudFront
- S3 versioning available
- Cost-effective for small-medium projects

---

## Netlify

### Configuration for ci.yml
Replace the deploy job with:

```yaml
  deploy:
    name: Deploy to Netlify
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    
    steps:
      - name: Download build artifact
        uses: actions/download-artifact@v4
        with:
          name: build-artifact
          path: build/

      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        with:
          args: deploy --prod --dir=build
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
        
      - name: Comment on PR
        uses: actions/github-script@v6
        if: github.event_name == 'pull_request'
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '✅ Deploy preview: https://deploy-preview-${{ github.event.number }}-YOUR_SITE.netlify.app'
            })
```

### GitHub Secrets Required
- `NETLIFY_AUTH_TOKEN`: Personal access token from Netlify
- `NETLIFY_SITE_ID`: Your site ID from Netlify

### Setup
1. Create account at netlify.com
2. Generate token: Settings > Applications > Personal access tokens
3. Get site ID from Site settings

### Advantages
- Deploy previews for PRs
- Automatic rollbacks
- Built-in form handling
- Excellent DX with CLI

---

## Vercel

### Configuration for ci.yml
Replace the deploy job with:

```yaml
  deploy:
    name: Deploy to Vercel
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### GitHub Secrets Required
- `VERCEL_TOKEN`: Token from Vercel account settings
- `VERCEL_ORG_ID`: Organization ID
- `VERCEL_PROJECT_ID`: Project ID

### Setup
1. Create account at vercel.com
2. Link your GitHub repository
3. Get IDs from `vercel env pull` or Vercel dashboard

### Advantages
- Automatic preview deployments
- Built-in analytics
- Edge functions support
- Serverless functions

---

## Docker + Container Registry

### Dockerfile
Create `Dockerfile` in project root:

```dockerfile
# Build stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:22-alpine
RUN npm install -g serve
WORKDIR /app
COPY --from=builder /app/build ./build
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
```

### Configuration for ci.yml
Add after build job:

```yaml
  docker-build-push:
    name: Build and Push Docker Image
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    
    permissions:
      contents: read
      packages: write
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ghcr.io/${{ github.repository }}:latest,ghcr.io/${{ github.repository }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### Advantages
- Environment consistency
- Easy Kubernetes deployment
- Multi-platform builds
- Container orchestration ready

---

## Multi-Environment Strategy

### Configuration with Staging and Production

```yaml
deploy:
  name: Deploy
  needs: build
  runs-on: ubuntu-latest
  strategy:
    matrix:
      environment: [staging, production]
    max-parallel: 1
  environment:
    name: ${{ matrix.environment }}
    url: https://${{ matrix.environment }}-cdviz.example.com
  
  steps:
    - name: Download artifacts
      uses: actions/download-artifact@v4
      with:
        name: build-artifact
        path: build/

    - name: Deploy to ${{ matrix.environment }}
      run: |
        if [ "${{ matrix.environment }}" == "staging" ]; then
          # Deploy to staging
          curl -X POST ${{ secrets.STAGING_DEPLOY_URL }}
        else
          # Deploy to production
          curl -X POST ${{ secrets.PRODUCTION_DEPLOY_URL }}
        fi
```

---

## Monitoring & Notifications

### Slack Notifications
Add to any job:

```yaml
- name: Notify Slack on Failure
  if: failure()
  uses: slackapi/slack-github-action@v1.24.0
  with:
    payload: |
      {
        "text": "❌ Deployment failed for ${{ github.repository }}",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "❌ *Deployment Failed*\nRepo: ${{ github.repository }}\nBranch: ${{ github.ref }}\nCommit: ${{ github.sha }}"
            }
          }
        ]
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Email Notifications
GitHub provides default email notifications. To customize, use:

```yaml
- name: Send email notification
  if: failure()
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: ${{ secrets.EMAIL_SERVER }}
    server_port: ${{ secrets.EMAIL_PORT }}
    username: ${{ secrets.EMAIL_USERNAME }}
    password: ${{ secrets.EMAIL_PASSWORD }}
    subject: Deploy failed for ${{ github.repository }}
    to: team@example.com
    from: ci@example.com
    body: Check the logs at ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
```

---

## Recommended Next Steps

1. **Choose a deployment platform** based on your needs
2. **Set up repository secrets** for your chosen platform
3. **Add monitoring** for deployments
4. **Configure branch protection** to require CI/CD success
5. **Set up notifications** for your team

