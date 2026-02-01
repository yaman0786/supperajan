# Süpperajan - AI Companion Mobile Application

> Yapay zeka tabanlı empatik asistan - Yol arkadaşınız, dostunuz, sizin istediğiniz her şey

![React Native](https://img.shields.io/badge/React%20Native-0.73.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0.4-blue)
![Material Design](https://img.shields.io/badge/Material%20Design-3-purple)

## 📱 Özellikler

### 🤖 Empatik AI Asistanı
- **Doğal Konuşma**: Kalıplaşmış yanıtlar yok, her konuşma benzersiz ve doğal
- **Duygusal Zeka**: Kullanıcının duygusal durumunu algılar ve buna göre yanıt verir
- **Kişiselleştirme**: Kişisel verilerden öğrenerek daha iyi yanıtlar sunar
- **Empati**: En yakın arkadaşınız gibi davranan, anlayışlı asistan

### 👾 3D Avatar
- **Futuristik Tasarım**: Metalik gövde, mavi neon detaylar
- **Gerçekçi Animasyonlar**:
  - Dudak senkronizasyonu (lip sync)
  - Jestler (el sallama, başını sallama, dinleme)
  - Mimikler (gülümseme, endişeli, heyecanlı, düşünen)
- **Duygusal Göstergeler**: Avatar, duygusal duruma göre görsel tepkiler verir

### 🎵 Sesli Etkileşim
- **Ses Sentezi**: Duygusal duruma göre ses tonu değişir
  - Mutlu: Daha hızlı ve yüksek ton
  - Üzgün: Daha yavaş ve düşük ton
  - Heyecanlı: Çok hızlı ve yüksek ton
  - Sakin: Normal hız, düz ton
- **Sesli Komutlar**: Mikrofon ile sesli mesaj gönderme

### 🎨 Material Design Arayüz
- **Futuristik Tema**: Koyu temalar, neon mavisi vurgular
- **Modern Bileşenler**: Kart tabanlı tasarım, animasyonlu geçişler
- **Kullanıcı Dostu**: Basit ve sezgisel arayüz

### 🔔 Hatırlatmalar
- Görev ve hatırlatma yönetimi
- Duygusal bağlam ile zenginleştirilmiş hatırlatmalar
- Tamamlanan görevleri işaretleme

### ⚙️ Kişiselleştirme
- İsim ve profil özelleştirme
- Sesli yanıtları açma/kapatma
- Duygusal analiz kontrolü
- Kişisel veri öğrenme ayarları

## 🏗️ Mimari

### Teknoloji Stack
- **Framework**: React Native 0.73.0
- **Dil**: TypeScript 5.0.4
- **UI Library**: React Native Paper (Material Design 3)
- **Navigation**: React Navigation 6.x
- **Storage**: AsyncStorage
- **Voice**: React Native Voice & TTS

### Proje Yapısı
```
supperajan/
├── src/
│   ├── components/          # Yeniden kullanılabilir bileşenler
│   │   ├── Avatar.tsx       # 3D Avatar bileşeni
│   │   ├── ChatInput.tsx    # Mesaj girişi
│   │   └── ChatMessageList.tsx  # Mesaj listesi
│   ├── screens/             # Uygulama ekranları
│   │   ├── ChatScreen.tsx   # Ana sohbet ekranı
│   │   ├── RemindersScreen.tsx  # Hatırlatmalar
│   │   └── SettingsScreen.tsx   # Ayarlar
│   ├── services/            # İş mantığı servisleri
│   │   ├── AIService.ts     # AI yanıt üretimi
│   │   └── StorageService.ts    # Veri saklama
│   ├── config/              # Konfigürasyon dosyaları
│   │   └── theme.ts         # Material Design tema
│   ├── types/               # TypeScript tip tanımlamaları
│   │   └── index.ts
│   └── App.tsx              # Ana uygulama bileşeni
├── index.js                 # Giriş noktası
├── package.json
└── tsconfig.json
```

## 🚀 Kurulum

### Gereksinimler
- Node.js >= 18
- React Native CLI
- Xcode (iOS için)
- Android Studio (Android için)

### Adımlar

1. **Bağımlılıkları yükleyin**:
```bash
npm install
# veya
yarn install
```

2. **iOS için (sadece macOS)**:
```bash
cd ios && pod install && cd ..
```

3. **Uygulamayı çalıştırın**:

Android için:
```bash
npm run android
```

iOS için:
```bash
npm run ios
```

Metro bundler'ı başlatmak için:
```bash
npm start
```

## 📖 Kullanım

### 1. İlk Açılış
- Uygulama açıldığında Süpperajan sizi karşılar
- Ayarlar sekmesinden isminizi girin
- Kişiselleştirme tercihlerinizi belirleyin

### 2. Sohbet
- Ana ekranda Süpperajan ile sohbet edin
- Mesajlarınıza empatik ve kişiselleştirilmiş yanıtlar alın
- Avatar, duygusal durumunuza göre tepki verir
- Önerilen yanıtlara tıklayarak hızlıca cevap verin

### 3. Hatırlatmalar
- Hatırlatmalar sekmesinde yeni hatırlatma ekleyin
- Tamamlanan görevleri işaretleyin
- Hatırlatmaları silin

### 4. Kişiselleştirme
- Ayarlar sekmesinden:
  - İsminizi güncelleyin
  - Sesli yanıtları açın/kapatın
  - Duygusal analizi yapılandırın
  - Veri öğrenme ayarlarını düzenleyin

## 🎨 Tema ve Tasarım

Uygulama, futuristik ve dost canlısı bir tasarım dili kullanır:

- **Ana Renkler**:
  - Neon Mavi (#00BFFF): Birincil vurgu rengi
  - Metalik Gri (#708090): Avatar gövdesi
  - Koyu Arka Plan (#0A0E27): Futuristik atmosfer
  
- **Animasyonlar**:
  - Yumuşak geçişler
  - Neon parıltı efektleri
  - Avatar jestleri ve mimikleri

## 🧠 AI Sistemi

### Duygusal Ton Algılama
AI, mesajlarınızdaki anahtar kelimeleri analiz ederek duygusal durumunuzu belirler:
- Mutlu: "mutlu", "harika", "süper", "mükemmel"
- Üzgün: "üzgün", "kötü", "mutsuz"
- Heyecanlı: "heyecanlı", "amazing"
- Endişeli: "endişeli", "kaygılı", "worried"

### Kişiselleştirilmiş Yanıtlar
- Her kullanıcı için benzersiz yanıtlar
- Konuşma geçmişinden öğrenme
- Sık kullanılan konuları hatırlama
- İsminizle kişisel yanıtlar

### Öneri Sistemi
Her duygusal duruma göre bağlamsal öneriler sunar.

## 🔒 Gizlilik ve Veri

- Tüm veriler cihazda saklanır (AsyncStorage)
- Sunucuya veri gönderilmez
- Kullanıcı istediği zaman tüm verileri silebilir
- Veri öğrenme ayarları kullanıcı kontrolündedir

## 🛠️ Geliştirme

### Test
```bash
npm test
```

### Lint
```bash
npm run lint
```

### Build
```bash
# Android
cd android && ./gradlew assembleRelease

# iOS
cd ios && xcodebuild -workspace Supperajan.xcworkspace -scheme Supperajan -configuration Release
```

## 📄 Lisans

MIT License

## 🤝 Katkıda Bulunma

Katkılarınız memnuniyetle karşılanır! Pull request göndermekten çekinmeyin.

## 📧 İletişim

Sorularınız için issue açabilirsiniz.

---

**Süpperajan** - Yapay zeka ile empati buluşuyor 💙🤖
