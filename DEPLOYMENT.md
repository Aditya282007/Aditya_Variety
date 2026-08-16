# Production Deployment Checklist

## 1. Backend Environment Variables (backend/.env)
```bash
# Server
PORT=5000
NODE_ENV=production

# Database - Use MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/variety-store

# JWT - Generate strong secret (openssl rand -base64 32)
JWT_SECRET=<strong-random-secret-64-chars>

# Frontend URL - Your production domain
FRONTEND_URL=https://yourdomain.com

# WhatsApp Business Number - Real number with country code
WHATSAPP_NUMBER=91XXXXXXXXXX

# Cloudinary - Your credentials
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
```

## 2. Frontend Environment Variables (frontend/.env)
```bash
VITE_API_URL=https://yourdomain.com/api
VITE_WHATSAPP_NUMBER=91XXXXXXXXXX
```

## 3. Pre-deployment Commands
```bash
# Build frontend
cd frontend && npm run build

# Backend is ready (no build step)
# Test production build locally:
cd frontend && npm run preview
```

## 4. Deployment Options

### Option A: Traditional VPS (DigitalOcean, Linode, AWS EC2)
- Use PM2 for process management
- Nginx reverse proxy
- SSL with Let's Encrypt

### Option B: Platform-as-a-Service
- **Backend**: Railway, Render, Fly.io, Heroku
- **Frontend**: Vercel, Netlify, Cloudflare Pages
- **Database**: MongoDB Atlas (already cloud)

### Option C: Docker
- Build images for both services
- Deploy to any container platform

## 5. Production Security Checklist
- [ ] Strong JWT_SECRET (64+ chars)
- [ ] MongoDB Atlas IP whitelist configured
- [ ] CORS origin set to production domain only
- [ ] HTTPS enforced (Nginx/Cloudflare)
- [ ] Secure cookies (secure: true in production)
- [ ] Rate limiting on auth endpoints
- [ ] Cloudinary upload limits configured

## 6. Quick Deploy Commands

### Render.com (easiest)
1. Connect GitHub repo
2. Create Web Service for backend
3. Create Static Site for frontend (build: `npm run build`, output: `dist`)
4. Add environment variables
5. Deploy

### Railway
1. `railway login && railway init`
2. Add MongoDB Atlas URI
3. Set env vars
4. `railway up`

### Docker
```dockerfile
# Backend Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]

# Frontend Dockerfile  
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```