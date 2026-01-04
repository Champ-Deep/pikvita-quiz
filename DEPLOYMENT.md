# 🚀 Deployment Guide

Complete guide to deploying the Pikvita quiz to production.

## Quick Start

```bash
# 1. Clone and setup
git clone https://github.com/pikvita/quiz.git
cd pikvita-quiz
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your settings

# 3. Test locally
npm run serve
# Visit http://localhost:8000

# 4. Deploy
# Follow platform-specific instructions below
```

## Environment Configuration

### Required Environment Variables

Create `.env` file with these values:

```bash
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/pikvita-quiz

# Email Service (choose one)
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxx...

# API Security
API_KEY=your-secret-key-change-in-production

# URLs
QUIZ_API_ENDPOINT=https://api.pikvita.com/api/quiz-responses
QUIZ_EMBED_URL=https://quiz.pikvita.com/embed
```

See `.env.example` for complete list.

---

## Deployment Options

### Option 1: Vercel (Recommended)

**Best for**: Serverless API + Static hosting

#### Setup

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Create `vercel.json`**:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/quiz-responses.js",
      "use": "@vercel/node"
    },
    {
      "src": "embed/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/quiz-responses.js"
    },
    {
      "src": "/embed/(.*)",
      "dest": "/embed/$1"
    }
  ],
  "env": {
    "MONGODB_URI": "@mongodb-uri",
    "SENDGRID_API_KEY": "@sendgrid-api-key",
    "API_KEY": "@api-key"
  }
}
```

3. **Add environment secrets**:
```bash
vercel secrets add mongodb-uri "your-mongodb-connection-string"
vercel secrets add sendgrid-api-key "your-sendgrid-key"
vercel secrets add api-key "your-api-key"
```

4. **Deploy**:
```bash
vercel --prod
```

5. **Configure custom domain** (optional):
```bash
vercel domains add quiz.pikvita.com
```

#### URLs:
- API: `https://your-project.vercel.app/api/quiz-responses`
- Embed: `https://your-project.vercel.app/embed/pikvita-quiz-embed.html`

---

### Option 2: Netlify

**Best for**: Static hosting + serverless functions

#### Setup

1. **Install Netlify CLI**:
```bash
npm install -g netlify-cli
```

2. **Create `netlify.toml`**:
```toml
[build]
  functions = "api"
  publish = "embed"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

3. **Restructure API for Netlify Functions**:

Create `api/quiz-responses/quiz-responses.js`:
```javascript
const handler = require('../quiz-responses');

exports.handler = async (event, context) => {
  // Convert Netlify event to Express-like req/res
  const req = {
    method: event.httpMethod,
    headers: event.headers,
    body: event.body ? JSON.parse(event.body) : null
  };

  let statusCode = 200;
  let body = '';

  const res = {
    setHeader: () => {},
    status: (code) => { statusCode = code; return res; },
    json: (data) => { body = JSON.stringify(data); },
    end: () => {}
  };

  await handler(req, res);

  return {
    statusCode,
    body,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  };
};
```

4. **Deploy**:
```bash
netlify init
netlify deploy --prod
```

5. **Configure environment**:
```bash
netlify env:set MONGODB_URI "your-mongodb-uri"
netlify env:set SENDGRID_API_KEY "your-sendgrid-key"
```

---

### Option 3: AWS (Lambda + S3 + CloudFront)

**Best for**: Enterprise scale, full control

#### Architecture:
- **S3**: Static files (embed/)
- **Lambda**: API (quiz-responses.js)
- **API Gateway**: REST API endpoint
- **CloudFront**: CDN distribution
- **Route53**: Custom domain

#### Setup

1. **Install AWS CLI & SAM CLI**:
```bash
brew install awscli aws-sam-cli  # Mac
aws configure
```

2. **Create `template.yaml` (SAM)**:
```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Parameters:
  MongoDBURI:
    Type: String
    NoEcho: true
  SendGridAPIKey:
    Type: String
    NoEcho: true

Resources:
  QuizAPI:
    Type: AWS::Serverless::Function
    Properties:
      Handler: api/quiz-responses.handler
      Runtime: nodejs18.x
      Environment:
        Variables:
          MONGODB_URI: !Ref MongoDBURI
          SENDGRID_API_KEY: !Ref SendGridAPIKey
      Events:
        QuizPost:
          Type: Api
          Properties:
            Path: /api/quiz-responses
            Method: POST
        QuizGet:
          Type: Api
          Properties:
            Path: /api/quiz-responses
            Method: GET

  EmbedBucket:
    Type: AWS::S3::Bucket
    Properties:
      WebsiteConfiguration:
        IndexDocument: example.html
      PublicAccessBlockConfiguration:
        BlockPublicAcls: false
      BucketEncryption:
        ServerSideEncryptionConfiguration:
          - ServerSideEncryptionByDefault:
              SSEAlgorithm: AES256

  CloudFrontDistribution:
    Type: AWS::CloudFront::Distribution
    Properties:
      DistributionConfig:
        Enabled: true
        Origins:
          - Id: S3Origin
            DomainName: !GetAtt EmbedBucket.DomainName
            S3OriginConfig:
              OriginAccessIdentity: ''
        DefaultCacheBehavior:
          TargetOriginId: S3Origin
          ViewerProtocolPolicy: redirect-to-https
          AllowedMethods: [GET, HEAD]
          CachedMethods: [GET, HEAD]
          ForwardedValues:
            QueryString: false
```

3. **Deploy**:
```bash
sam build
sam deploy --guided \
  --parameter-overrides \
    MongoDBURI=$MONGODB_URI \
    SendGridAPIKey=$SENDGRID_API_KEY
```

4. **Upload static files to S3**:
```bash
aws s3 sync embed/ s3://your-embed-bucket/
```

---

### Option 4: Heroku

**Best for**: Quick deployment, managed infrastructure

#### Setup

1. **Install Heroku CLI**:
```bash
brew install heroku  # Mac
heroku login
```

2. **Create `Procfile`**:
```
web: node api/quiz-responses.js
```

3. **Create Express wrapper** (`server.js`):
```javascript
const express = require('express');
const path = require('path');
const quizHandler = require('./api/quiz-responses');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use('/embed', express.static(path.join(__dirname, 'embed')));

// API endpoint
app.all('/api/quiz-responses', quizHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

4. **Deploy**:
```bash
heroku create pikvita-quiz
heroku config:set MONGODB_URI="your-mongodb-uri"
heroku config:set SENDGRID_API_KEY="your-key"
git push heroku main
```

---

### Option 5: Railway

**Best for**: Simple deployment, great DX

#### Setup

1. **Install Railway CLI**:
```bash
npm install -g @railway/cli
railway login
```

2. **Initialize**:
```bash
railway init
```

3. **Add environment variables**:
```bash
railway variables set MONGODB_URI="your-uri"
railway variables set SENDGRID_API_KEY="your-key"
```

4. **Deploy**:
```bash
railway up
```

---

## Database Setup

### MongoDB Atlas (Recommended)

1. **Create cluster**: https://cloud.mongodb.com
2. **Create database user**
3. **Whitelist IP addresses** (0.0.0.0/0 for serverless)
4. **Get connection string**:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/pikvita-quiz
   ```

### Self-Hosted MongoDB

```bash
# Docker
docker run -d -p 27017:27017 \
  -v /data/db:/data/db \
  --name mongodb \
  mongo:latest

# Connection string
mongodb://localhost:27017/pikvita-quiz
```

---

## Email Service Setup

### SendGrid (Recommended)

1. **Sign up**: https://sendgrid.com
2. **Create API key**: Settings → API Keys
3. **Verify sender**: Settings → Sender Authentication
4. **Add to `.env`**:
   ```
   EMAIL_PROVIDER=sendgrid
   SENDGRID_API_KEY=SG.xxxxx...
   EMAIL_FROM=hello@pikvita.com
   ```

### Mailgun

1. **Sign up**: https://mailgun.com
2. **Add domain**: Sending → Domains
3. **Get API key**: Settings → API Keys
4. **Configure**:
   ```
   EMAIL_PROVIDER=mailgun
   MAILGUN_API_KEY=key-xxxxx
   MAILGUN_DOMAIN=pikvita.com
   ```

### AWS SES

1. **Enable SES**: AWS Console → SES
2. **Verify domain**
3. **Create IAM user** with SES permissions
4. **Configure**:
   ```
   EMAIL_PROVIDER=ses
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=AKIA...
   AWS_SECRET_ACCESS_KEY=xxxxx
   ```

---

## CDN Setup (Optional)

### Cloudflare

1. **Add site to Cloudflare**
2. **Update DNS**:
   - `quiz.pikvita.com` → CNAME → your-deployment-url
   - `api.pikvita.com` → CNAME → your-api-url
3. **Enable caching**:
   - Page Rules → Cache Everything
   - Edge Cache TTL: 1 year for static assets

### AWS CloudFront

1. **Create distribution**
2. **Origin**: Your S3 bucket or API endpoint
3. **Cache behaviors**:
   - `/embed/*` → Cache for 1 year
   - `/api/*` → No cache
4. **SSL certificate**: ACM

---

## Monitoring & Analytics

### Sentry (Error Tracking)

```javascript
// Add to quiz-responses.js
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});

// Wrap handler
module.exports = Sentry.wrapHandler(async (req, res) => {
  // ... your code
});
```

### Datadog (Application Monitoring)

```javascript
// Add to top of quiz-responses.js
const tracer = require('dd-trace').init({
  service: 'pikvita-quiz-api',
  env: process.env.NODE_ENV
});
```

### LogRocket (Session Replay)

Add to embed HTML:
```html
<script src="https://cdn.logrocket.io/LogRocket.min.js"></script>
<script>
  window.LogRocket && window.LogRocket.init('your-app-id');
</script>
```

---

## Security Checklist

Before going live:

- [ ] Change default API_KEY in `.env`
- [ ] Configure CORS origins (not `*`)
- [ ] Enable HTTPS only
- [ ] Set secure headers:
  ```javascript
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  ```
- [ ] Rate limit API endpoint
- [ ] Sanitize user inputs
- [ ] Use environment variables for secrets
- [ ] Enable MongoDB authentication
- [ ] Set up backup strategy

---

## Performance Optimization

### 1. Enable Compression

```javascript
const compression = require('compression');
app.use(compression());
```

### 2. Cache Static Assets

```
Cache-Control: public, max-age=31536000, immutable
```

### 3. Optimize Images

```bash
# Use WebP format
convert image.png -quality 80 image.webp
```

### 4. Minimize JavaScript

```bash
npx terser pikvita-quiz.js -o pikvita-quiz.min.js
```

### 5. Use CDN

Point embed files to CDN:
```
https://cdn.pikvita.com/quiz/pikvita-quiz.min.js
```

---

## Backup Strategy

### Database Backups

```bash
# MongoDB Atlas: Automatic backups enabled
# Self-hosted: Cron job
0 2 * * * mongodump --uri="$MONGODB_URI" --out=/backups/$(date +\%Y\%m\%d)
```

### Code Backups

```bash
# Git repository (primary)
git push origin main

# Mirror to multiple remotes
git remote add backup git@backup-server:pikvita-quiz.git
git push backup main
```

---

## Rollback Plan

If deployment fails:

### Vercel
```bash
vercel rollback
```

### Netlify
```bash
netlify rollback
```

### Heroku
```bash
heroku rollback
```

### AWS
```bash
sam deploy --rollback
```

---

## Testing in Production

### Smoke Tests

```bash
# Test API
curl -X POST https://api.pikvita.com/api/quiz-responses \
  -H "Content-Type: application/json" \
  -d '{"userDetails":{"name":"Test","email":"test@test.com"},"answers":{},"persona":{},"score":{}}'

# Test embed
curl https://quiz.pikvita.com/embed/pikvita-quiz-embed.html
```

### Load Testing

```bash
# Install artillery
npm install -g artillery

# Run load test
artillery quick --count 100 --num 10 https://api.pikvita.com/api/quiz-responses
```

---

## Post-Deployment Checklist

- [ ] API endpoint accessible
- [ ] Embed loads correctly
- [ ] Email sending works
- [ ] MongoDB connected
- [ ] Analytics tracking
- [ ] SSL certificate valid
- [ ] Custom domain configured
- [ ] Monitoring enabled
- [ ] Backups configured
- [ ] Documentation updated

---

## Troubleshooting

### API Returns 500 Error

**Check**:
1. MongoDB connection string correct
2. Environment variables set
3. API key configured
4. Check logs: `vercel logs` or platform equivalent

### Emails Not Sending

**Check**:
1. SendGrid API key valid
2. Sender email verified
3. Check email service logs
4. Test with different provider

### Quiz Not Loading

**Check**:
1. CORS configured correctly
2. Script URL accessible
3. No JavaScript errors in console
4. CDN not blocking requests

### Slow Performance

**Optimize**:
1. Enable caching
2. Use CDN
3. Optimize images
4. Minimize JavaScript
5. Check MongoDB indexes

---

## Support

Need help deploying?
- 📧 Email: hello@pikvita.com
- 📚 Docs: https://docs.pikvita.com
- 💬 Discord: https://discord.gg/pikvita

---

Made with 🧡 by the Pikvita team
