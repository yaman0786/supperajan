# Süpperajan Web - Deployment Guide

## Web Platformu için Kurulum ve Deployment Rehberi

### Hızlı Başlangıç

```bash
# Bağımlılıkları yükle
npm install

# Development sunucusunu başlat
npm run web

# Tarayıcıda aç: http://localhost:3000
```

---

## Development (Geliştirme)

### Gereksinimler
- Node.js 18+
- npm veya yarn
- Modern bir tarayıcı

### Komutlar

```bash
# Development mode ile başlat
npm run web

# Hot reload ile çalışır
# Değişiklikler otomatik yüklenir
```

**Port:** 3000 (varsayılan)
**Hot Reload:** ✅ Aktif
**Source Maps:** ✅ Aktif

---

## Production Build (Üretim)

### Build Oluşturma

```bash
# Production build
npm run build:web
```

**Output:** `web-build/` klasörü
**Optimize:** ✅ Minified, compressed
**Source Maps:** ❌ (production'da gizli)

### Build İçeriği

```
web-build/
├── index.html          # Ana HTML dosyası
├── bundle.[hash].js    # Minified JavaScript
└── assets/            # Statik dosyalar
    ├── images/
    └── models/
```

---

## Deployment Seçenekleri

### 1. Netlify (Önerilir - En Kolay)

**Adım 1:** Netlify hesabı oluştur (ücretsiz)

**Adım 2:** GitHub repo'yu bağla veya drag & drop

**Adım 3:** Build ayarları:
```
Build command: npm run build:web
Publish directory: web-build
```

**Adım 4:** Deploy!

**Avantajlar:**
- ✅ Ücretsiz SSL
- ✅ CDN
- ✅ Otomatik deploy (git push ile)
- ✅ Preview deployments
- ✅ Custom domain

**URL Örneği:** `https://supperajan.netlify.app`

---

### 2. Vercel

**Adım 1:** Vercel hesabı oluştur

**Adım 2:** GitHub repo'yu import et

**Adım 3:** Build ayarları:
```
Framework Preset: Other
Build Command: npm run build:web
Output Directory: web-build
```

**Adım 4:** Deploy!

**Avantajlar:**
- ✅ Ücretsiz SSL
- ✅ Global CDN
- ✅ Otomatik deploy
- ✅ Analytics
- ✅ Edge functions

**URL Örneği:** `https://supperajan.vercel.app`

---

### 3. GitHub Pages

**Adım 1:** GitHub repo settings

**Adım 2:** `package.json`'a ekle:
```json
{
  "homepage": "https://username.github.io/supperajan"
}
```

**Adım 3:** Build ve deploy:
```bash
npm run build:web
# web-build içeriğini gh-pages branch'ine push
```

**Adım 4:** Settings → Pages → Source: gh-pages

**URL Örneği:** `https://username.github.io/supperajan`

---

### 4. Firebase Hosting

**Adım 1:** Firebase CLI yükle
```bash
npm install -g firebase-tools
```

**Adım 2:** Firebase projesi oluştur
```bash
firebase login
firebase init hosting
```

**Adım 3:** `firebase.json` ayarları:
```json
{
  "hosting": {
    "public": "web-build",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

**Adım 4:** Build ve deploy:
```bash
npm run build:web
firebase deploy
```

**Avantajlar:**
- ✅ Google infrastructure
- ✅ Free SSL
- ✅ CDN
- ✅ Analytics

**URL Örneği:** `https://supperajan.web.app`

---

### 5. AWS S3 + CloudFront

**Adım 1:** S3 bucket oluştur

**Adım 2:** Static website hosting aktif et

**Adım 3:** Build ve upload:
```bash
npm run build:web
aws s3 sync web-build/ s3://your-bucket-name
```

**Adım 4:** CloudFront distribution oluştur (opsiyonel, CDN için)

**Avantajlar:**
- ✅ Scalable
- ✅ Enterprise-grade
- ✅ Full control

**Maliyet:** Pay-as-you-go

---

### 6. DigitalOcean App Platform

**Adım 1:** DigitalOcean hesabı

**Adım 2:** Create App → GitHub repo

**Adım 3:** Build ayarları:
```
Build Command: npm run build:web
Output Directory: web-build
```

**Adım 4:** Deploy!

**Avantajlar:**
- ✅ Managed platform
- ✅ Easy scaling
- ✅ Built-in monitoring

**Maliyet:** $5/month+

---

## Environment Variables

### Development
```bash
# .env.development
REACT_APP_API_URL=http://localhost:3000
REACT_APP_ENV=development
```

### Production
```bash
# .env.production
REACT_APP_API_URL=https://api.supperajan.com
REACT_APP_ENV=production
```

### Kullanım
```typescript
const apiUrl = process.env.REACT_APP_API_URL;
```

**Not:** `.env` dosyaları `.gitignore`'da olmalı

---

## Custom Domain

### Netlify
1. Settings → Domain management
2. Add custom domain
3. DNS ayarlarını güncelle

### Vercel
1. Settings → Domains
2. Add domain
3. DNS ayarlarını güncelle

### DNS Ayarları (Örnek)
```
Type: CNAME
Name: www
Value: your-deployment-url.netlify.app
```

---

## Performance Optimization

### 1. Code Splitting
```typescript
// Lazy load screens
const ChatScreen = React.lazy(() => import('./screens/ChatScreen'));
```

### 2. Image Optimization
```bash
# WebP formatına çevir
# Resize to appropriate sizes
```

### 3. Bundle Analysis
```bash
# webpack-bundle-analyzer ekle
npm install --save-dev webpack-bundle-analyzer
```

### 4. Caching Strategy
```
Cache-Control: public, max-age=31536000, immutable
```

---

## Monitoring

### Google Analytics
```html
<!-- public/index.html içine ekle -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

### Sentry (Error Tracking)
```bash
npm install @sentry/react
```

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: process.env.REACT_APP_ENV,
});
```

---

## Security

### HTTPS
✅ Tüm modern hosting platformları ücretsiz SSL sağlar

### Content Security Policy
```html
<!-- public/index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline'">
```

### CORS
Web sunucuda CORS headers ayarla (eğer API kullanıyorsanız)

---

## Testing

### Local Production Build
```bash
# Build oluştur
npm run build:web

# Basit sunucu ile test et
npx serve web-build

# Tarayıcıda aç: http://localhost:3000
```

### Browser Testing
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers

---

## CI/CD Setup

### GitHub Actions

`.github/workflows/deploy-web.yml`:
```yaml
name: Deploy Web

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build:web
        
      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        with:
          args: deploy --prod --dir=web-build
        env:
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
```

---

## Troubleshooting

### Build Errors

**Problem:** Module not found
```bash
# Çözüm: Dependencies'i temizle ve yeniden yükle
rm -rf node_modules
npm install
```

**Problem:** Webpack errors
```bash
# Çözüm: Cache temizle
rm -rf node_modules/.cache
npm run build:web
```

### Runtime Errors

**Problem:** White screen
```
# Çözüm: Browser console'u kontrol et
# Source maps aktif ise debug kolay
```

**Problem:** Icons not showing
```bash
# Çözüm: Vector icons webpack config'de
# Zaten ayarlı, cache sorunuysa:
Ctrl+Shift+R (hard refresh)
```

---

## Progressive Web App (PWA)

### Service Worker (Gelecek Özellik)

```typescript
// Offline support
// Push notifications
// Install prompt
```

**Avantajlar:**
- Offline çalışma
- Daha hızlı yükleme
- App-like deneyim
- Push notifications

---

## Best Practices

✅ **Always test production build locally**
✅ **Use environment variables for configs**
✅ **Enable compression (gzip/brotli)**
✅ **Set up error tracking (Sentry)**
✅ **Monitor performance (Lighthouse)**
✅ **Use CDN for assets**
✅ **Implement caching strategy**
✅ **Regular security updates**

---

## Support & Resources

- **Documentation:** [MULTI_PLATFORM_GUIDE.md](MULTI_PLATFORM_GUIDE.md)
- **Platform Comparison:** [PLATFORM_COMPARISON.md](PLATFORM_COMPARISON.md)
- **Issues:** GitHub Issues
- **Webpack Config:** `webpack.config.js`

---

## Quick Deployment Cheatsheet

```bash
# Netlify
netlify deploy --prod --dir=web-build

# Vercel
vercel --prod

# Firebase
firebase deploy

# AWS S3
aws s3 sync web-build/ s3://bucket-name

# GitHub Pages
gh-pages -d web-build
```

---

## License

MIT License - See LICENSE file

---

**Happy Deploying! 🚀**

Web siteniz şimdi dünya çapında erişilebilir!
