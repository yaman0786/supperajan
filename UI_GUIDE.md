# Süpperajan - Kullanıcı Arayüzü Rehberi

## 📱 Ekran Açıklamaları

### 1. Ana Sohbet Ekranı (ChatScreen)

#### Üst Bölüm: Avatar
```
┌─────────────────────────────────┐
│                                 │
│      ╭───────────╮             │
│     ╱   ◉   ◉   ╲             │ ← 3D Avatar
│    │   ‾‾‾‾‾‾‾   │            │   (Metalik + Neon Mavi)
│     ╲___________╱             │
│         │███│                  │
│         │═══│                  │ ← Neon çizgiler
│         │═══│                  │
│                                 │
│     Süpperajan                  │ ← Asistan adı
│  Seninle konuşmaya hazır       │ ← Durum bilgisi
│                                 │
└─────────────────────────────────┘
```

**Özellikler**:
- Avatar duygusal duruma göre renk değiştirir
- Konuşurken dudaklar hareket eder (lip sync)
- Jestler: el sallama, başını sallama, düşünme
- Mimikler: gülümseme, endişeli, heyecanlı

#### Orta Bölüm: Mesajlar
```
┌─────────────────────────────────┐
│                                 │
│  ┌─────────────────────┐       │
│  │ Merhaba! Nasılsın?  │       │ ← Kullanıcı mesajı
│  │ 14:30            ──┘│       │   (Sağ taraf, mavi)
│  └─────────────────────┘       │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Selam! Ben iyiyim,      │   │ ← Asistan yanıtı
│  │ sorduğun için teşekkür  │   │   (Sol taraf, gri)
│  │ ederim 😊               │   │   + Emoji gösterge
│  │ 14:30                   │   │
│  └───────────────────────-─┘   │
│                                 │
└─────────────────────────────────┘
```

**Özellikler**:
- Sonsuz kaydırma
- Zaman damgası
- Duygusal emoji göstergeleri
- Material Design kartlar

#### Alt Bölüm: Öneriler ve Girdi
```
┌─────────────────────────────────┐
│  ┌─────┐ ┌───────┐ ┌─────────┐│
│  │Bugün│ │Ne haber│ │Yardım et││ ← Öneri chip'leri
│  │neler││         │ │         ││
│  └─────┘ └───────┘ └─────────┘│
│                                 │
│  🎤 │ Mesajınızı yazın... │ ➤  │ ← Girdi alanı
│                                 │
└─────────────────────────────────┘
```

**Özellikler**:
- Bağlamsal öneriler (duygusal duruma göre)
- Sesli girdi butonu
- Mesaj gönder butonu
- Çok satırlı metin girişi

### 2. Hatırlatmalar Ekranı (RemindersScreen)

```
┌─────────────────────────────────┐
│  Hatırlatmalarım                │
│                                 │
│  ┌─────────────────────────┐   │
│  │ ☑ Toplantıya git        │   │ ← Tamamlanmış
│  │   Saat 15:00            │   │
│  │   1 Feb 2026        [Sil]   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ ☐ Alışveriş yap         │   │ ← Bekleyen
│  │   Pazardan süt al       │   │
│  │   2 Feb 2026        [Sil]   │
│  └─────────────────────────┘   │
│                                 │
│                                 │
│                           [+]   │ ← Yeni ekleme
└─────────────────────────────────┘
```

**Özellikler**:
- Hatırlatma kartları
- Checkbox ile tamamlama
- Tarih gösterimi
- Silme işlevi
- FAB (Floating Action Button) ile yeni ekleme

**Dialog: Yeni Hatırlatma**
```
┌─────────────────────────────────┐
│  Yeni Hatırlatma                │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Başlık:                 │   │
│  │ [________________]      │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Açıklama (isteğe bağlı):│   │
│  │ [________________]      │   │
│  │ [________________]      │   │
│  └─────────────────────────┘   │
│                                 │
│              [İptal]  [Ekle]    │
└─────────────────────────────────┘
```

### 3. Ayarlar Ekranı (SettingsScreen)

```
┌─────────────────────────────────┐
│  Kişiselleştirme                │
│                                 │
│  İsminiz                        │
│  [_________________________]   │
│                                 │
├─────────────────────────────────┤
│  Özellikler                     │
│                                 │
│  🔊 Sesli Yanıtlar          [◐] │ ← Switch açık
│     Asistanın sesli yanıt       │
│     vermesini sağlar            │
│                                 │
│  🔔 Bildirimler             [○] │ ← Switch kapalı
│     Hatırlatma bildirimleri     │
│                                 │
│  ❤️  Duygusal Analiz        [◐] │
│     Duygusal durumunuza göre    │
│                                 │
│  🧠 Kişisel Veri Öğrenme   [◐] │
│     Sizden öğrenerek gelişir    │
│                                 │
├─────────────────────────────────┤
│  Hakkında                       │
│                                 │
│  ℹ️  Versiyon: 1.0.0            │
│  🤖 Süpperajan                  │
│     Yapay zeka tabanlı asistan  │
│                                 │
│  [    Ayarları Kaydet    ]      │
│  [  Tüm Verileri Temizle ]      │
│                                 │
└─────────────────────────────────┘
```

**Özellikler**:
- İsim kişiselleştirme
- Özellik switch'leri
- Açıklayıcı metinler
- Kaydetme butonu
- Veri silme butonu

### 4. Alt Navigasyon Barı

```
┌─────────────────────────────────┐
│  💬      🔔      ⚙️             │
│ Sohbet  Hatırlatma  Ayarlar     │
└─────────────────────────────────┘
```

**Özellikler**:
- 3 ana sekme
- Material Design iconları
- Aktif sekme vurgusu (neon mavi)
- Pasif sekmeler (gri)

## 🎨 Renk Paleti

### Ana Renkler
```
Neon Mavi (Primary):   ████ #00BFFF
Royal Blue:            ████ #4169E1
Metalik Gri:           ████ #708090
Koyu Arka Plan:        ████ #0A0E27
Koyu Surface:          ████ #1A1F3A
Açık Metin:            ████ #E8E8E8
```

### Duygusal Renkler
```
Mutlu:     ████ #FFD700 (Altın)
Üzgün:     ████ #4169E1 (Mavi)
Heyecanlı: ████ #FF1493 (Pembe)
Sakin:     ████ #00CED1 (Turkuaz)
Endişeli:  ████ #FF6347 (Domates Kırmızısı)
```

## 🎭 Avatar Durumları

### Mimikler (Expressions)
```
Gülümseme:    ◕ ◕
              ⌣

Nötr:         ◕ ◕
              —

Endişeli:     ◕ ◕
              ⌢

Heyecanlı:    ◎ ◎
              ○

Düşünen:      ◕ ◕
              ╱
```

### Jestler (Gestures)
- **Wave**: Sağa sola sallanma
- **Nod**: Yukarı aşağı hareket
- **Idle**: Sabit duruş
- **Listening**: Ses dalgaları gösterim
- **Speaking**: Dudak hareketi + ölçeklendirme

## 📐 Tasarım Prensipleri

### Material Design 3
- **Elevation**: 0-5 arası katman derinliği
- **Border Radius**: 16px yuvarlaklık
- **Padding**: 16px standart boşluk
- **Typography**: 
  - Başlık: 24px bold
  - Alt başlık: 20px medium
  - Gövde: 16px regular
  - Küçük: 12px regular

### Animasyonlar
- **Geçiş Süresi**: 200-300ms
- **Easing**: Ease-in-out
- **Parıltı**: 1500ms döngü
- **Lip Sync**: 200ms döngü

### Boşluklar
```
┌─ Container (16px) ──────────────┐
│ ┌─ Card (12px) ───────────────┐│
│ │ ┌─ Content (8px) ─────────┐││
│ │ │  Text                   │││
│ │ └─────────────────────────┘││
│ └─────────────────────────────┘│
└─────────────────────────────────┘
```

## 🔄 Etkileşim Akışları

### Mesaj Gönderme
```
1. Kullanıcı mesaj yazar
   ↓
2. Gönder butonuna basar
   ↓
3. Avatar "dinliyor" durumuna geçer
   ↓
4. Mesaj listeye eklenir
   ↓
5. AI yanıt üretir (1-2 saniye)
   ↓
6. Avatar "konuşuyor" durumuna geçer
   ↓
7. Yanıt listeye eklenir
   ↓
8. Öneriler güncellenir
   ↓
9. Avatar "idle" durumuna döner
```

### Hatırlatma Ekleme
```
1. + butonuna bas
   ↓
2. Dialog açılır
   ↓
3. Başlık ve açıklama gir
   ↓
4. "Ekle" butonuna bas
   ↓
5. Dialog kapanır
   ↓
6. Yeni hatırlatma listeye eklenir
   ↓
7. Veri kaydedilir
```

## 💡 Kullanıcı Deneyimi İpuçları

### Sohbet
- Önerilere tıklayarak hızlıca yanıt verin
- Sesli girdi ile eller serbest kullanım
- Avatar duygularınıza tepki verir
- Uzun konuşmalarda önceki konular hatırlanır

### Kişiselleştirme
- İsminizi girin, asistan sizinle isminizle konuşur
- Sesli yanıtları açarak daha doğal deneyim
- Duygusal analiz ile empati artar
- Veri öğrenme ile zamanla iyileşme

### Gizlilik
- Tüm veriler cihazda kalır
- İstediğiniz zaman silebilirsiniz
- Öğrenme özellikleri kapatılabilir

## 🎬 Animasyon Detayları

### Avatar Parıltısı
- Sürekli döngü
- 0.3 → 0.8 opacity
- 1500ms süre
- Ease-in-out

### Dudak Senkronizasyonu
- Konuşma sırasında aktif
- 1.0 → 1.05 scale
- 200ms döngü
- Konuşma bitince durur

### Mesaj Görünümü
- Fade in animasyonu
- 300ms süre
- Bottom to top slide

### Navigasyon Geçişi
- Screen transitions
- 250ms süre
- Slide animasyonu
