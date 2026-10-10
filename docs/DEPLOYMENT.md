# Al Mostafa Mall — Production Deployment & Operations Guide

## 1. Overview

**Al Mostafa Mall (مول المصطفى)** is configured for seamless deployment to modern static CDN platforms (Vercel, Netlify, Cloudflare Pages) or containerized Linux environments (Docker / Nginx), backed by a Supabase PostgreSQL cluster.

---

## 2. Environment Variables

Create `.env` or `.env.production` in the project root:

```ini
# Supabase Backend Configuration (Optional for cloud sync)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

*Note: If no Supabase credentials are provided, the application automatically uses its high-fidelity local relational database engine (`dbStore`) backed by `localStorage`, ensuring zero downtime and fully offline/standalone capability.*

---

## 3. Deployment Targets

### 3.1. Vercel Deployment

1. Install Vercel CLI or connect your GitHub repository:
   ```bash
   npm i -g vercel
   vercel
   ```
2. Set Build Command: `npm run build`
3. Set Output Directory: `dist`
4. In `vercel.json`, ensure SPA rewrites:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

### 3.2. Netlify Deployment

In `netlify.toml` in the project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3.3. Docker & Nginx Deployment

Create `Dockerfile`:

```dockerfile
# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

With `nginx.conf`:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
}
```

---

## 4. Verification & Health Check

Before releasing any build to production:

```bash
# 1. Typecheck & Integrity
npx tsc -b

# 2. Production Bundle Build
npm run build

# 3. Local Production Preview
npm run preview
```
