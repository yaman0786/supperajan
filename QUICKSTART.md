# Süpperajan - Hızlı Başlangıç

## ⚡ 5 Dakikada Başla

### 1. Kurulum (2 dakika)
```bash
git clone https://github.com/yaman0786/supperajan.git
cd supperajan
npm install
```

### 2. iOS Pods (Sadece Mac - 1 dakika)
```bash
cd ios && pod install && cd ..
```

### 3. Çalıştır (2 dakika)
```bash
# Android
npm run android

# iOS
npm run ios
```

## 📱 İlk Kullanım

### Adım 1: Karşılama
- Uygulama açıldığında Süpperajan sizi karşılar
- 3D avatar görünür (metalik gövde, mavi neon)

### Adım 2: İsim Ayarla
1. Alt menüden "Ayarlar" sekmesine git
2. "İsminiz" alanına adınızı yazın
3. "Ayarları Kaydet" butonuna bas

### Adım 3: İlk Sohbet
1. "Sohbet" sekmesine dön
2. Alt kısımdaki metin kutusuna "Merhaba" yaz
3. Gönder butonuna bas (➤)
4. Avatar animasyonlu yanıt verir

## 🎯 Temel Özellikler

### Sohbet Ekranı
```
┌─────────────────────────┐
│      🤖 Avatar          │ ← Animasyonlu
│                         │
│  Konuşma Geçmişi       │ ← Mesajlar
│  ━━━━━━━━━━━━━━━       │
│                         │
│  [Öneriler]            │ ← Chip'ler
│  🎤 [Mesaj...] ➤       │ ← Girdi
└─────────────────────────┘
```

### Duygusal Yanıtlar
- **Mutlu mesaj** → Coşkulu yanıt
- **Üzgün mesaj** → Destekleyici yanıt
- **Endişeli mesaj** → Çözüm odaklı yanıt

### Avatar Animasyonları
- **Dinleme**: Ses dalgaları
- **Konuşma**: Dudak hareketi
- **Düşünme**: Yan bakış
- **Mutlu**: Gülümseme

## 🔔 Hatırlatmalar

### Yeni Hatırlatma Ekle
1. "Hatırlatmalar" sekmesine git
2. Sağ alttaki + butonuna bas
3. Başlık ve açıklama gir
4. "Ekle" butonuna bas

### Hatırlatma Tamamla
- Checkbox'a tıkla ✓

## ⚙️ Ayarlar

### Sesli Yanıt Aç/Kapat
Ayarlar → "Sesli Yanıtlar" → Switch

### Duygusal Analiz
Ayarlar → "Duygusal Analiz" → Switch

### Veri Temizle
Ayarlar → "Tüm Verileri Temizle"

## 💡 Pro İpuçları

### 1. Önerileri Kullan
Alt taraftaki chip'lere tıklayarak hızlıca yanıt ver

### 2. Düzenli Sohbet Et
Asistan senden öğrendikçe daha iyi yanıtlar verir

### 3. Sesli Girdi
🎤 mikrofon butonuna basarak sesle mesaj gönder

### 4. Kişiselleştir
İsminizi ayarlayın, asistan sizinle isminizle konuşur

## 🎨 Tema

### Renkler
- **Neon Mavi**: Vurgular ve avatar
- **Koyu Tema**: Futuristik görünüm
- **Metalik**: Avatar gövdesi

### Animasyonlar
- Smooth 60 FPS
- Neon parıltı efektleri
- Gerçekçi mimikler

## 🐛 Sorun Giderme

### Metro Başlamıyor
```bash
npm start -- --reset-cache
```

### Build Hatası
```bash
# Android
cd android && ./gradlew clean && cd ..

# iOS
cd ios && pod deintegrate && pod install && cd ..
```

### Port Hatası
```bash
npm start -- --port 8088
```

## 📚 Daha Fazla Bilgi

- **Tüm Özellikler**: [FEATURES.md](FEATURES.md)
- **Kurulum Detayları**: [SETUP.md](SETUP.md)
- **Mimari**: [ARCHITECTURE.md](ARCHITECTURE.md)
- **UI Rehberi**: [UI_GUIDE.md](UI_GUIDE.md)

## 🎉 Başarılar!

Artık Süpperajan kullanmaya hazırsınız!

**İlk Konuşma Önerileri**:
- "Merhaba, nasılsın?"
- "Bugün nasıl geçiyor?"
- "Biraz üzgünüm"
- "Çok mutluyum!"
- "Yarın için hatırlat"

---

**Süpperajan** - Senin en iyi arkadaşın! 💙🤖
