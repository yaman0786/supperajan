# Süpperajan - Geliştirici Kurulum Rehberi

## 📋 Ön Gereksinimler

### Sistem Gereksinimleri

#### macOS (iOS ve Android için)
- macOS 12.0 (Monterey) veya üzeri
- Xcode 14.0 veya üzeri
- CocoaPods 1.11 veya üzeri
- Node.js 18.x veya üzeri
- Watchman (önerilen)
- JDK 11 veya üzeri

#### Windows (Sadece Android için)
- Windows 10/11
- Node.js 18.x veya üzeri
- JDK 11 veya üzeri
- Android Studio (Arctic Fox veya üzeri)

#### Linux (Sadece Android için)
- Ubuntu 20.04 veya üzeri (önerilen)
- Node.js 18.x veya üzeri
- JDK 11 veya üzeri
- Android Studio

## 🔧 Kurulum Adımları

### 1. Node.js Kurulumu

#### macOS (Homebrew ile)
```bash
brew install node
brew install watchman
```

#### Windows (Chocolatey ile)
```bash
choco install nodejs
```

#### Linux (apt ile)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. React Native CLI Kurulumu

```bash
npm install -g react-native-cli
```

### 3. Android Geliştirme Ortamı

#### Android Studio Kurulumu
1. [Android Studio](https://developer.android.com/studio)'yu indirin
2. Kurulum sırasında şunları seçin:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device

#### SDK Kurulumu
Android Studio içinde:
1. **Preferences** → **Appearance & Behavior** → **System Settings** → **Android SDK**
2. Şu platformları yükleyin:
   - Android 13.0 (Tiramisu) - API Level 33
   - Android SDK Build-Tools 33.0.0
   - Android SDK Platform-Tools
   - Android SDK Tools

#### Çevre Değişkenleri (macOS/Linux)
`~/.bash_profile` veya `~/.zshrc` dosyasına ekleyin:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

#### Çevre Değişkenleri (Windows)
1. **System Properties** → **Advanced** → **Environment Variables**
2. Yeni sistem değişkeni:
   - Variable name: `ANDROID_HOME`
   - Variable value: `C:\Users\KULLANICI_ADI\AppData\Local\Android\Sdk`

### 4. iOS Geliştirme Ortamı (Sadece macOS)

#### Xcode Kurulumu
1. App Store'dan Xcode'u indirin
2. Command Line Tools'u yükleyin:
```bash
xcode-select --install
```

#### CocoaPods Kurulumu
```bash
sudo gem install cocoapods
```

## 🚀 Proje Kurulumu

### 1. Repository'yi Klonlayın
```bash
git clone https://github.com/yaman0786/supperajan.git
cd supperajan
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
# veya
yarn install
```

### 3. iOS Pods Kurulumu (Sadece macOS)
```bash
cd ios
pod install
cd ..
```

## 📱 Uygulamayı Çalıştırma

### Android

#### Emülatör ile
1. Android Studio'da AVD Manager'ı açın
2. Yeni bir sanal cihaz oluşturun (Pixel 5, API 33 önerilir)
3. Emülatörü başlatın
4. Terminalde:
```bash
npm run android
```

#### Fiziksel Cihaz ile
1. Cihazda **Developer Options** ve **USB Debugging** etkinleştirin
2. USB ile bilgisayara bağlayın
3. Bağlantıyı doğrulayın:
```bash
adb devices
```
4. Uygulamayı çalıştırın:
```bash
npm run android
```

### iOS (Sadece macOS)

#### Simulator ile
```bash
npm run ios
```

Belirli bir simulator için:
```bash
npm run ios -- --simulator="iPhone 14 Pro"
```

#### Fiziksel Cihaz ile
1. Xcode'da `ios/Supperajan.xcworkspace` dosyasını açın
2. **Signing & Capabilities** sekmesinde Apple ID'nizi ekleyin
3. Cihazı seçin
4. Run butonuna basın

## 🛠️ Geliştirme Araçları

### Metro Bundler
Metro, React Native'in JavaScript bundler'ıdır. Otomatik başlar ancak manuel başlatmak için:

```bash
npm start
```

Temizlemek için:
```bash
npm start -- --reset-cache
```

### Debugging

#### Chrome DevTools
1. Uygulamada Dev Menu'yü açın:
   - iOS: `Cmd + D`
   - Android: `Cmd + M` (Mac) veya `Ctrl + M` (Windows/Linux)
2. **Debug** seçeneğini seçin
3. Chrome'da `http://localhost:8081/debugger-ui` açılır

#### React Native Debugger
Daha gelişmiş debugging için:
```bash
brew install --cask react-native-debugger
```

#### Flipper
Facebook'un mobil uygulama debugging aracı:
1. [Flipper](https://fbflipper.com/)'ı indirin
2. Uygulamayı başlatın
3. Flipper otomatik olarak bağlanır

### Hot Reload
Kod değişikliklerini otomatik yüklemek için:
- **Fast Refresh**: Otomatik etkin
- **Hot Reload**: Dev Menu → Enable Hot Reloading

## 📦 Build ve Release

### Android APK Build

#### Debug APK
```bash
cd android
./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

#### Release APK
1. Keystore oluşturun:
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore supperajan-release.keystore -alias supperajan -keyalg RSA -keysize 2048 -validity 10000
```

2. `android/gradle.properties` dosyasına ekleyin:
```properties
SUPPERAJAN_UPLOAD_STORE_FILE=supperajan-release.keystore
SUPPERAJAN_UPLOAD_KEY_ALIAS=supperajan
SUPPERAJAN_UPLOAD_STORE_PASSWORD=****
SUPPERAJAN_UPLOAD_KEY_PASSWORD=****
```

3. Build:
```bash
cd android
./gradlew assembleRelease
# APK: android/app/build/outputs/apk/release/app-release.apk
```

### Android AAB (Play Store için)
```bash
cd android
./gradlew bundleRelease
# AAB: android/app/build/outputs/bundle/release/app-release.aab
```

### iOS Build

#### Debug
Xcode'da **Product** → **Build** (`Cmd + B`)

#### Release/Archive
1. Xcode'da **Product** → **Archive**
2. **Organizer** açılır
3. **Distribute App** seçeneğini seçin
4. İstediğiniz dağıtım yöntemini seçin (App Store, Ad Hoc, vb.)

## 🧪 Test

### Unit Tests
```bash
npm test
```

Watch mode ile:
```bash
npm test -- --watch
```

Coverage ile:
```bash
npm test -- --coverage
```

### E2E Tests (Detox - kurulum gerekli)
```bash
# iOS
detox test --configuration ios.sim.debug

# Android
detox test --configuration android.emu.debug
```

## 🐛 Sorun Giderme

### Metro Bundler Sorunları
```bash
# Cache temizleme
npm start -- --reset-cache

# Watchman temizleme (macOS)
watchman watch-del-all
```

### Android Gradle Sorunları
```bash
cd android
./gradlew clean
cd ..
```

### iOS Build Sorunları
```bash
cd ios
pod deintegrate
pod install
cd ..
```

### Node Modules Sorunu
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### Port Zaten Kullanımda
Metro varsayılan olarak port 8081 kullanır. Değiştirmek için:
```bash
npm start -- --port 8088
```

## 📚 Faydalı Komutlar

### Git
```bash
# Yeni branch oluştur
git checkout -b feature/yeni-ozellik

# Değişiklikleri commit et
git add .
git commit -m "Yeni özellik eklendi"

# Branch'i push et
git push origin feature/yeni-ozellik
```

### NPM/Yarn
```bash
# Bağımlılık ekle
npm install paket-adi
yarn add paket-adi

# Dev bağımlılık ekle
npm install --save-dev paket-adi
yarn add -D paket-adi

# Bağımlılık güncelle
npm update
yarn upgrade
```

### React Native
```bash
# Yeni component oluştur
# src/components/YeniComponent.tsx

# Link native modüller (eski versiyon)
react-native link

# Info görüntüle
react-native info

# Log görüntüle
react-native log-android
react-native log-ios
```

## 🔐 Güvenlik

### API Anahtarları
Hassas bilgileri kod içine yazmayın. `.env` dosyası kullanın:

1. `.env` dosyası oluşturun:
```
API_KEY=your-api-key
API_URL=https://api.example.com
```

2. `react-native-config` yükleyin:
```bash
npm install react-native-config
```

3. Kullanın:
```typescript
import Config from 'react-native-config';
const apiKey = Config.API_KEY;
```

### .gitignore
`.env` dosyasının `.gitignore`'da olduğundan emin olun.

## 📖 Ek Kaynaklar

### Dokümantasyon
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [React Navigation](https://reactnavigation.org/docs/getting-started)

### Topluluk
- [React Native Community](https://github.com/react-native-community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native)
- [Discord](https://discord.gg/react-native)

### Video Tutorials
- [React Native Tutorial for Beginners](https://www.youtube.com/watch?v=0-S5a0eXPoc)
- [Build and Deploy React Native App](https://www.youtube.com/watch?v=CpR2Q_pKJbU)

## 💬 Destek

Sorunlarla karşılaşırsanız:
1. GitHub Issues'da arayın
2. Yeni issue açın
3. Discord/Slack topluluğuna katılın

## 🎉 Tebrikler!

Artık Süpperajan uygulamasını geliştirmeye hazırsınız! Mutlu kodlamalar! 🚀
