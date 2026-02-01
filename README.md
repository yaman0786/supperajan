# Süpperajan - AI Companion Application

> Yapay zeka tabanlı empatik asistan - Yol arkadaşınız, dostunuz, sizin istediğiniz her şey

![React Native](https://img.shields.io/badge/React%20Native-0.73.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0.4-blue)
![Material Design](https://img.shields.io/badge/Material%20Design-3-purple)
![Multi-Platform](https://img.shields.io/badge/Platform-Web%20%7C%20Android%20%7C%20iOS%20%7C%20macOS-green)

## 🌍 Multi-Platform Support

**Süpperajan** artık **dört platformda** çalışıyor:

- 🌐 **Web** - Tarayıcıda çalışır, kurulum gerektirmez
- 📱 **Android** - Android 6.0+ telefonlar
- 📱 **iOS** - iPhone ve iPad (iOS 13.0+)
- 💻 **macOS** - Mac bilgisayarlar (macOS 11.0+)

Tek kod tabanı, dört platform! 🚀

## 📱 Özellikler

### 🤖 Empatik AI Asistanı
- **Doğal Konuşma**: Kalıplaşmış yanıtlar yok, her konuşma benzersiz ve doğal
- **Duygusal Zeka**: Kullanıcının duygusal durumunu algılar ve buna göre yanıt verir
- **Kişiselleştirme**: Kişisel verilerden öğrenerek daha iyi yanıtlar sunar
- **Empati**: En yakın arkadaşınız gibi davranan, anlayışlı asistan

### 👾 3D Avatar
- **Futuristik Tasarım**: Metalik gövde, mavi neon detaylar
- **GLB Model Desteği**: Kendi 3D GLB modellerinizi yükleyebilirsiniz
- **2D Fallback**: 3D model yüklenemezse otomatik 2D avatar'a geçiş
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
- Platform-specific tools (see below)

### Quick Start by Platform

#### 🌐 Web
```bash
npm install
npm run web
# Open http://localhost:3000
```

#### 📱 Android
```bash
npm install
npm run android
# Requires: Android Studio, Android SDK
```

#### 📱 iOS (macOS only)
```bash
npm install
cd ios && pod install && cd ..
npm run ios
# Requires: Xcode, CocoaPods
```

#### 💻 macOS
```bash
npm install
npm run macos
# Requires: Xcode
```

### Detaylı Kurulum

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

Web için:
```bash
npm run web
```

Android için:
```bash
npm run android
```

iOS için:
```bash
npm run ios
```

macOS için:
```bash
npm run macos
```

Metro bundler'ı başlatmak için (mobile):
```bash
npm start
```

**📚 Multi-Platform Rehberi:** Detaylı platform bilgileri için [MULTI_PLATFORM_GUIDE.md](MULTI_PLATFORM_GUIDE.md) dosyasına bakın.

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

### 5. 3D Avatar (GLB) Kullanımı
- **GLB Model Yükleme**: Kendi 3D avatar modelinizi kullanabilirsiniz
- Model gereksinimler: GLB/GLTF formatı, maksimum 5MB
- Detaylı bilgi için: [GLB Avatar Rehberi](GLB_AVATAR_GUIDE.md)
- Örnekler: `assets/models/` klasörüne model ekleyin
- Fallback: 3D model yüklenemezse otomatik 2D avatar kullanılır

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
# SupperAjan

AI tabanlı mobil uygulama konsepti: kullanıcının en yakın arkadaşı gibi davranan, empatik ve kişiselleştirilebilir bir asistan.

## 1) Uygulamanın temel özellik listesi
- **Kişisel asistan fonksiyonları:** dinleme, analiz etme, sohbet, fikir sunma, uyarı ve hatırlatma.
- **Bilgi erişimi:** geniş bilgi ve belge kütüphanesi üzerinden hızlı cevaplar ve yönlendirmeler.
- **Empatik iletişim:** kişisel verilerden öğrenen, kalıplaşmış olmayan, doğal ve sıcak diyalog.
- **Kişiselleştirme:** ses tonu, konuşma stili, avatar görünümü, özel gün mesajları, alışkanlık bazlı öneriler.

## 2) Ana ekran ve sohbet ekranı tasarım önerileri (Material Design)
### Ana ekran
- **App bar:** sol üstte avatar durumu, sağ üstte bildirim ve ayarlar.
- **Hero alan:** 3D avatar merkezde, etrafında kısa durum kartı (günlük özet, öneri).
- **Hızlı eylemler:** “Hatırlatma ekle”, “Günlük özet”, “Ruh halimi paylaş”.
- **Renkler:** koyu zemin + mavi neon vurgu, temiz tipografi ve yumuşak gölgeler.

### Sohbet ekranı
- **Konuşma balonları:** kullanıcı ve avatar için farklı tonlarda kartlar.
- **Sesli giriş butonu:** FAB olarak alt merkezde.
- **Duygu göstergesi:** avatarın mini ikonu ve o anki ruh hâli etiketi.
- **Eylem çipleri:** “Detay ver”, “Örnek göster”, “Hatırlat”.

## 3) Kullanıcı akışı
1. **İlk giriş:** kısa tanıtım, izinler (mikrofon, bildirim).
2. **Profil oluşturma:** isim, hedefler, günlük rutin, duygu tercihleri.
3. **Avatarla etkileşim:** ilk selamlaşma ve demo sohbet.
4. **Kişiselleştirme ayarları:** ses tonu, konuşma stili, görünüm, özel günler.
5. **Bilgi sorgulama:** metin/ sesli sorgu → cevap → takip soruları.

## 4) Avatarın tasarım detayları
- **Renk paleti:** metalik gri gövde, mavi neon çizgiler, beyaz vurgular.
- **Malzeme:** fırçalanmış metal + hafif yansımalar.
- **Işık:** yüz ve göğüste yumuşak mavi aydınlatma.
- **Aksesuarlar:** kulaklık, bileklik, küçük holografik rozet.
- **Hareket:** insan benzeri yumuşak geçişler, göz teması.

## 5) Avatarın davranış ve animasyon senaryoları
- **Dudak senkronizasyonu:** konuşma temposuna göre ağız hareketleri.
- **El/kol jestleri:** selam, açıklama yaparken açma/kapama hareketleri.
- **Baş hareketleri:** onaylama, düşünme için hafif eğme.
- **Göz hareketleri:** göz kırpma, odaklanma ve takip.
- **Mimikler:** gülümseme, şaşırma, üzülme, kaş kaldırma.
- **Durum animasyonları:** uyku modu (yavaş nefes), uyarı (keskin hareket), düşünme pozu.

## 6) Duygusal tepki + ses tonu senaryoları
- **Mutlu:** neşeli, enerjik ton, hızlı konuşma.
- **Üzgün:** yumuşak, düşük ton, yavaş konuşma.
- **Şaşırmış:** hafif yüksek perde, kısa duraklamalar.
- **Sinirli:** düşük perde, net ve keskin ton.
- **Heyecanlı:** yüksek enerji, hızlı konuşma.
- **Düşünceli:** orta ton, yavaş ve duraklamalı konuşma.

## 7) Uygulama içi etkileşim senaryoları
- **Uygulamaya giriş:** avatar selam verir, enerjik ses tonu.
- **Sohbet başlatma:** samimi animasyon, sıcak ses tonu.
- **Hatırlatma:** ciddi animasyon, net ses tonu.
- **Bilgi sunma:** açıklayıcı jestler, analitik ses tonu.
- **Duygusal destek:** empatik animasyon, yumuşak ses tonu.
- **Uyarı verme:** dikkat çekici animasyon, ciddi ses tonu.
- **Eğlenceli etkileşim:** enerjik animasyon, pozitif ses tonu.
