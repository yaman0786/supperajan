# Süpperajan - Multi-Platform Guide

## Platform Support

Süpperajan now supports **four platforms**:
- 🌐 **Web** (Browser)
- 📱 **Android** 
- 📱 **iOS**
- 💻 **macOS**

## Quick Start by Platform

### 🌐 Web

**Development:**
```bash
npm install
npm run web
```
The app will open at `http://localhost:3000`

**Production Build:**
```bash
npm run build:web
```
Output will be in `web-build/` directory. Deploy these files to any static hosting service.

**Deployment Options:**
- **Netlify**: Drag and drop `web-build` folder
- **Vercel**: Connect GitHub repo, set build command to `npm run build:web`
- **GitHub Pages**: Upload `web-build` contents to `gh-pages` branch
- **Firebase Hosting**: `firebase deploy`

---

### 📱 Android

**Development:**
```bash
npm install
npm run android
```

**Production APK:**
```bash
cd android
./gradlew assembleRelease
# APK: android/app/build/outputs/apk/release/app-release.apk
```

**Requirements:**
- Android Studio
- Android SDK (API 23+)
- Java JDK 11+

---

### 📱 iOS

**Development:**
```bash
npm install
cd ios && pod install && cd ..
npm run ios
```

**Production Build:**
1. Open `ios/Supperajan.xcworkspace` in Xcode
2. Product → Archive
3. Distribute App

**Requirements:**
- macOS
- Xcode 14+
- CocoaPods
- Apple Developer Account (for distribution)

---

### 💻 macOS

**Development:**
```bash
npm install
npm run macos
```

**Production Build:**
1. Open macOS project in Xcode
2. Product → Archive
3. Distribute App

**Requirements:**
- macOS 11.0+
- Xcode 14+
- React Native macOS CLI

---

## Platform-Specific Features

### Feature Availability Matrix

| Feature | Web | Android | iOS | macOS |
|---------|-----|---------|-----|-------|
| Chat Interface | ✅ | ✅ | ✅ | ✅ |
| 2D Avatar | ✅ | ✅ | ✅ | ✅ |
| 3D GLB Avatar | ✅ | ✅ | ✅ | ✅ |
| Reminders | ✅ | ✅ | ✅ | ✅ |
| Settings | ✅ | ✅ | ✅ | ✅ |
| Voice Input | ❌ | ✅ | ✅ | ✅ |
| Text-to-Speech | ❌ | ✅ | ✅ | ✅ |
| Local Storage | ✅ | ✅ | ✅ | ✅ |
| Push Notifications | ❌* | ✅ | ✅ | ✅ |
| Native Sharing | ❌ | ✅ | ✅ | ✅ |

*Web notifications require additional configuration

---

## Platform-Specific Considerations

### Web

**Advantages:**
- No installation required
- Universal access via URL
- Instant updates
- Cross-platform by default

**Limitations:**
- No voice input/TTS (browser APIs limited)
- LocalStorage instead of AsyncStorage
- No native app integrations
- Performance depends on browser

**Browser Support:**
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

**Storage:**
- Uses `localStorage` API
- 5-10MB limit (browser dependent)
- Data persists per domain

---

### Android

**Advantages:**
- Full native features
- Voice input/TTS support
- Better performance
- Native integrations

**Minimum SDK:**
- API Level 23 (Android 6.0)

**Permissions Required:**
- INTERNET
- RECORD_AUDIO (for voice input)
- WRITE_EXTERNAL_STORAGE (for GLB models)

---

### iOS

**Advantages:**
- Premium user experience
- Smooth animations
- Native integrations
- App Store distribution

**Minimum Version:**
- iOS 13.0+

**Permissions Required:**
- Microphone (for voice input)
- Speech Recognition (optional)

---

### macOS

**Advantages:**
- Desktop experience
- Large screen support
- Keyboard shortcuts
- File system access

**Minimum Version:**
- macOS 11.0 (Big Sur)+

**Native Features:**
- Menu bar integration
- Touch Bar support (if available)
- Keyboard shortcuts

---

## Development Tips

### Platform Detection in Code

```typescript
import { isWeb, isIOS, isAndroid, isMacOS } from './utils/platform';

// Check platform
if (isWeb) {
  // Web-specific code
}

// Select platform-specific value
import { selectPlatform } from './utils/platform';

const fontSize = selectPlatform({
  web: 16,
  mobile: 14,
  default: 14,
});
```

### Feature Detection

```typescript
import { isFeatureSupported } from './utils/platform';

if (isFeatureSupported('voice')) {
  // Enable voice input
}
```

---

## Building for Production

### Web Production Checklist

- [ ] Run `npm run build:web`
- [ ] Test in production mode locally
- [ ] Optimize images and assets
- [ ] Configure domain and SSL
- [ ] Set up analytics (optional)
- [ ] Test on multiple browsers

### Android Release Checklist

- [ ] Generate signing key
- [ ] Configure `gradle.properties`
- [ ] Update version in `build.gradle`
- [ ] Build release APK/AAB
- [ ] Test on real devices
- [ ] Upload to Play Store

### iOS Release Checklist

- [ ] Configure signing certificates
- [ ] Update version and build number
- [ ] Archive in Xcode
- [ ] Test on real devices
- [ ] Upload to App Store Connect

### macOS Release Checklist

- [ ] Configure signing and notarization
- [ ] Update version
- [ ] Archive in Xcode
- [ ] Notarize app
- [ ] Upload to Mac App Store or distribute directly

---

## Common Issues & Solutions

### Web

**Issue:** Icons not showing
```bash
# Solution: Ensure react-native-vector-icons is configured
# Icons are automatically handled by webpack config
```

**Issue:** White screen on load
```bash
# Solution: Check browser console for errors
# Enable source maps for debugging
```

**Issue:** Storage not persisting
```bash
# Solution: Check browser localStorage isn't disabled
# Some browsers in private mode disable localStorage
```

---

### Android

**Issue:** Build fails
```bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
npm run android
```

**Issue:** Metro bundler not starting
```bash
# Reset cache
npm start -- --reset-cache
```

---

### iOS

**Issue:** Pod install fails
```bash
cd ios
pod deintegrate
pod install
cd ..
```

**Issue:** Xcode build errors
```bash
# Clean build folder
# In Xcode: Product → Clean Build Folder
```

---

### macOS

**Issue:** macOS platform not found
```bash
# Install React Native macOS
npx react-native-macos-init
```

---

## Performance Optimization

### Web

1. **Enable code splitting**
   - Already configured in webpack.config.js
   
2. **Optimize bundle size**
   ```bash
   # Analyze bundle
   npm run build:web -- --analyze
   ```

3. **Use lazy loading for screens**
   ```typescript
   const ChatScreen = React.lazy(() => import('./screens/ChatScreen'));
   ```

### Mobile (Android/iOS)

1. **Enable Hermes** (already enabled in React Native 0.73)
2. **Optimize images**
   - Use WebP format
   - Compress assets
3. **Profile with Flipper**

---

## Testing

### Test on All Platforms

```bash
# Web
npm run web
# Open http://localhost:3000 in different browsers

# Android
npm run android

# iOS
npm run ios

# macOS
npm run macos
```

### Cross-Platform Testing Checklist

- [ ] Navigation works on all platforms
- [ ] Storage persists across sessions
- [ ] UI renders correctly
- [ ] Touch/click interactions work
- [ ] Keyboard shortcuts (desktop)
- [ ] Responsive layout (web)

---

## Deployment

### Web Hosting

**Netlify (Easiest):**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build:web
netlify deploy --prod --dir=web-build
```

**Vercel:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### App Store Distribution

**Android (Google Play):**
1. Create Play Console account
2. Generate signed AAB
3. Upload via Play Console
4. Complete store listing
5. Submit for review

**iOS (App Store):**
1. Create App Store Connect account
2. Archive in Xcode
3. Upload via Xcode
4. Complete app information
5. Submit for review

**macOS (Mac App Store):**
1. Configure in App Store Connect
2. Archive and upload
3. Submit for review

---

## Environment Variables

Create `.env` files for environment-specific config:

```bash
# .env.development
API_URL=http://localhost:3000

# .env.production
API_URL=https://api.supperajan.com
```

Access in code:
```typescript
const apiUrl = process.env.API_URL;
```

---

## CI/CD Setup

### GitHub Actions Example

```yaml
# .github/workflows/build.yml
name: Build All Platforms

on: [push]

jobs:
  web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm run build:web
      
  android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: cd android && ./gradlew assembleRelease
      
  ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: cd ios && pod install
      - run: xcodebuild -workspace ios/Supperajan.xcworkspace
```

---

## Support & Community

- **Documentation:** See README.md and other guides
- **Issues:** GitHub Issues
- **Platform-specific help:** Platform-specific documentation

---

## Version Compatibility

| Süpperajan | React Native | Web | Android | iOS | macOS |
|------------|--------------|-----|---------|-----|-------|
| 1.0.0 | 0.73.0 | ✅ | 6.0+ | 13.0+ | 11.0+ |

---

## Next Steps

1. **Choose your platform(s)**
2. **Follow platform-specific setup**
3. **Build and test**
4. **Deploy**

Enjoy building for multiple platforms! 🚀
