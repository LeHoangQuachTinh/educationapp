# 🚀 Hướng dẫn Deploy HappyClass

## 📋 Mục lục
1. [Chuẩn bị](#chuẩn-bị)
2. [Build Production](#build-production)
3. [Deploy lên Vercel](#deploy-lên-vercel)
4. [Deploy lên Netlify](#deploy-lên-netlify)
5. [Deploy lên GitHub Pages](#deploy-lên-github-pages)
6. [Deploy lên VPS/Server](#deploy-lên-vpsserver)
7. [Environment Variables](#environment-variables)
8. [Troubleshooting](#troubleshooting)

---

## Chuẩn bị

### Yêu cầu hệ thống:
- Node.js >= 16.x
- npm >= 8.x hoặc yarn >= 1.22.x
- Git

### Kiểm tra trước khi deploy:
```bash
# 1. Kiểm tra version
node -v
npm -v

# 2. Install dependencies
npm install

# 3. Test build local
npm run build

# 4. Preview build
npm run preview
```

---

## Build Production

### Build ứng dụng:
```bash
npm run build
```

Folder `dist/` sẽ chứa các file đã build:
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ...
└── ...
```

### Tối ưu build:
Trong `vite.config.js`, đã có cấu hình tối ưu:
```javascript
build: {
  outDir: 'dist',
  minify: 'terser',
  sourcemap: false,
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor': ['react', 'react-dom', 'react-router-dom'],
        'charts': ['recharts'],
        'export': ['xlsx', 'jspdf', 'jspdf-autotable']
      }
    }
  }
}
```

---

## Deploy lên Vercel

### Cách 1: Deploy qua Vercel CLI

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Deploy production
vercel --prod
```

### Cách 2: Deploy qua GitHub (Khuyến nghị)

1. Push code lên GitHub
2. Vào https://vercel.com/
3. Click "Import Project"
4. Chọn repository
5. Configure:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Click "Deploy"

### Vercel Configuration
Tạo file `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## Deploy lên Netlify

### Cách 1: Netlify CLI

```bash
# 1. Install Netlify CLI
npm i -g netlify-cli

# 2. Login
netlify login

# 3. Build
npm run build

# 4. Deploy
netlify deploy --prod --dir=dist
```

### Cách 2: Netlify Drop (Đơn giản nhất)

1. Build: `npm run build`
2. Vào https://app.netlify.com/drop
3. Kéo thả folder `dist/`

### Cách 3: GitHub Integration (Khuyến nghị)

1. Push code lên GitHub
2. Vào https://app.netlify.com/
3. Click "New site from Git"
4. Chọn repository
5. Configure:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"

### Netlify Configuration
Tạo file `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

---

## Deploy lên GitHub Pages

### Setup:

1. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Thêm vào `package.json`:
```json
{
  "homepage": "https://[username].github.io/[repo-name]",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. Update `vite.config.js`:
```javascript
export default defineConfig({
  base: '/[repo-name]/',
  // ... other config
})
```

4. Deploy:
```bash
npm run deploy
```

---

## Deploy lên VPS/Server

### Sử dụng Nginx:

1. **Build ứng dụng:**
```bash
npm run build
```

2. **Upload lên server:**
```bash
scp -r dist/* user@server:/var/www/happyclass/
```

3. **Cấu hình Nginx:**
```nginx
server {
    listen 80;
    server_name happyclass.com www.happyclass.com;
    root /var/www/happyclass;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

4. **Restart Nginx:**
```bash
sudo systemctl restart nginx
```

### Sử dụng PM2 + Serve:

```bash
# 1. Install serve globally
npm install -g serve pm2

# 2. Build
npm run build

# 3. Serve with PM2
pm2 serve dist 3000 --name "happyclass" --spa

# 4. Save PM2 config
pm2 save
pm2 startup
```

---

## Environment Variables

### Development (.env.local):
```bash
VITE_API_URL=http://localhost:3000/api
VITE_ENABLE_DEBUG=true
```

### Production:

**Vercel:**
- Dashboard → Settings → Environment Variables

**Netlify:**
- Site settings → Build & deploy → Environment

**VPS:**
```bash
# Tạo .env.production
VITE_API_URL=https://api.happyclass.com
VITE_ENABLE_DEBUG=false
```

---

## Troubleshooting

### Lỗi: "Cannot GET /"

**Nguyên nhân:** SPA routing không được cấu hình đúng

**Giải pháp:**
- Vercel: Thêm `vercel.json` với rewrites
- Netlify: Thêm `_redirects` hoặc `netlify.toml`
- Nginx: Cấu hình `try_files`

### Lỗi: 404 Not Found khi refresh

**Giải pháp:** Cấu hình server redirect tất cả về `index.html`

### Lỗi: Module not found

**Giải pháp:**
```bash
# Xóa node_modules và reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Lỗi: Build quá lâu hoặc out of memory

**Giải pháp:**
```bash
# Tăng memory limit cho Node
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### File quá lớn

**Giải pháp:**
- Check bundle size: `npm run build -- --mode production --analyze`
- Code splitting trong `vite.config.js`
- Lazy load components

---

## 🎯 Checklist Deploy

- [ ] Test build local: `npm run build && npm run preview`
- [ ] Check responsive trên mobile/tablet
- [ ] Test các tính năng chính
- [ ] Cập nhật environment variables
- [ ] Setup HTTPS/SSL
- [ ] Configure CDN (nếu cần)
- [ ] Setup monitoring/analytics
- [ ] Backup database (nếu có)
- [ ] Test performance (Lighthouse)
- [ ] Setup error tracking (Sentry)

---

## 📊 Performance Tips

### 1. Code Splitting:
```javascript
// Lazy load routes
const TeacherDashboard = lazy(() => import('./pages/teacher/Dashboard'))
```

### 2. Image Optimization:
- Sử dụng WebP
- Lazy load images
- Compress images

### 3. Caching:
- Cache static assets
- Service Worker (PWA)

### 4. CDN:
- Cloudflare
- AWS CloudFront
- Vercel Edge Network

---

## 🔒 Security Checklist

- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] CORS configured
- [ ] Input validation
- [ ] SQL injection protection
- [ ] XSS protection
- [ ] CSRF tokens
- [ ] Rate limiting
- [ ] Environment variables secured

---

## 📞 Support

Nếu gặp vấn đề khi deploy, liên hệ:
- GitHub Issues
- Email: support@happyclass.com

---

**Happy Deploying! 🚀**
