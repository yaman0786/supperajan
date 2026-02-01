# Süpperajan - Mimari Dokümantasyonu

## Genel Bakış

Süpperajan, kullanıcılarına empatik ve kişiselleştirilmiş bir deneyim sunan yapay zeka tabanlı mobil bir asistan uygulamasıdır. Bu belge, uygulamanın teknik mimarisini, bileşenlerini ve çalışma prensiplerini açıklar.

## Sistem Mimarisi

### Katmanlar

```
┌─────────────────────────────────────┐
│     Presentation Layer (UI)         │
│  - Screens (Chat, Reminders, etc.)  │
│  - Components (Avatar, Input, etc.) │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│        Business Logic Layer         │
│  - AIService (Response generation)  │
│  - StorageService (Data persist.)   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Data Layer                  │
│  - AsyncStorage (Local storage)     │
│  - In-memory context (Learning)     │
└─────────────────────────────────────┘
```

## Temel Bileşenler

### 1. AIService (services/AIService.ts)

**Sorumluluklar**:
- Kullanıcı mesajlarını analiz etme
- Duygusal ton tespiti
- Kişiselleştirilmiş yanıt üretimi
- Bağlamsal öneriler oluşturma
- Ses sentezi parametrelerini belirleme

**Ana Fonksiyonlar**:

```typescript
generateResponse(message, userProfile, history): Promise<AIResponse>
// Kullanıcı mesajına empati dolu yanıt üretir

detectEmotionalTone(message): EmotionalTone
// Mesajdan duygusal durumu tespit eder

learnFromContext(message, userProfile): void
// Kullanıcı verilerinden öğrenir

textToSpeech(text, emotionalTone): Promise<void>
// Metni sese çevirir, duygusal tona göre ayarlar
```

**Duygusal Ton Algoritması**:
1. Mesaj küçük harfe dönüştürülür
2. Anahtar kelimeler aranır (mutlu, üzgün, endişeli, vb.)
3. Eşleşen ilk duygusal ton döndürülür
4. Eşleşme yoksa "neutral" döner

**Yanıt Üretimi**:
1. Duygusal ton belirlenir
2. Ton bazlı yanıt şablonlarından biri seçilir
3. Kullanıcı adı ile kişiselleştirilir
4. Konuşma geçmişi uzunsa, öğrenilen konular eklenir
5. Öneri listesi oluşturulur

### 2. StorageService (services/StorageService.ts)

**Sorumluluklar**:
- Kullanıcı profili saklama
- Konuşma geçmişi yönetimi
- Hatırlatmaları kaydetme
- Kullanıcı tercihlerini saklama

**Veri Modeli**:
```typescript
UserProfile {
  id: string
  name: string
  preferences: Record<string, any>
  conversationHistory: Message[]
  emotionalState?: EmotionalTone
  personalData: Record<string, any>
}

Message {
  id: string
  text: string
  sender: 'user' | 'assistant'
  timestamp: Date
  emotionalTone?: EmotionalTone
}

Reminder {
  id: string
  title: string
  description?: string
  dueDate: Date
  isCompleted: boolean
  emotionalContext?: string
}
```

### 3. Avatar Component (components/Avatar.tsx)

**Özellikler**:
- Metalik gövde tasarımı
- Mavi neon detaylar
- Animasyonlu mimikler
- Jestler (wave, nod, idle, listening, speaking)
- Duygusal duruma göre renk değişimi
- Lip sync animasyonu

**Animasyonlar**:
- **Glow Effect**: Sürekli neon parıltı efekti
- **Gesture Animations**: Jestlere göre rotasyon ve ölçeklendirme
- **Lip Sync**: Konuşma sırasında dudak hareketi simülasyonu

**Duygusal Renk Paleti**:
- Happy: #FFD700 (Altın)
- Sad: #4169E1 (Royal Blue)
- Excited: #FF1493 (Deep Pink)
- Calm: #00CED1 (Dark Turquoise)
- Concerned: #FF6347 (Tomato)
- Neutral: #00BFFF (Deep Sky Blue)

### 4. ChatScreen (screens/ChatScreen.tsx)

**Ana İşlevler**:
1. Mesaj gönderme ve alma
2. Avatar durumunu güncelleme
3. Sohbet geçmişini görüntüleme
4. Önerileri gösterme ve işleme
5. Sesli girişi tetikleme

**Durum Yönetimi**:
```typescript
messages: Message[]          // Sohbet geçmişi
userProfile: UserProfile     // Kullanıcı profili
avatarState: AvatarState     // Avatar'ın mevcut durumu
suggestions: string[]        // Önerilen yanıtlar
isProcessing: boolean        // AI işleme durumu
```

**Mesaj İşleme Akışı**:
1. Kullanıcı mesaj gönderir
2. Mesaj listeye eklenir
3. Avatar "listening/thinking" durumuna geçer
4. AIService'ten yanıt istenir
5. AI yanıtı alınır
6. Avatar "speaking" durumuna geçer ve lip sync başlar
7. Yanıt mesaj listesine eklenir
8. Öneriler güncellenir
9. Ses sentezi başlatılır
10. 2 saniye sonra avatar "idle" durumuna döner
11. Konuşma geçmişi kaydedilir

## Veri Akışı

### Mesaj Gönderme Akışı

```
User Input
    ↓
ChatInput Component
    ↓
ChatScreen.handleSendMessage()
    ↓
├─→ Add user message to state
├─→ Update avatar (listening)
├─→ AIService.generateResponse()
│       ↓
│   ├─→ detectEmotionalTone()
│   ├─→ learnFromContext()
│   └─→ generateEmpatheticResponse()
│       ↓
│   Return AIResponse
    ↓
├─→ Add assistant message to state
├─→ Update avatar (speaking + lipSync)
├─→ Update suggestions
├─→ AIService.textToSpeech()
├─→ StorageService.saveConversationHistory()
└─→ Reset avatar (idle)
```

## Kişiselleştirme ve Öğrenme

### Öğrenme Mekanizması

AIService, kullanıcı mesajlarından öğrenmek için basit bir frekans tabanlı sistem kullanır:

1. **Kelime Frekansı**: Her kelime için kullanım sayısını tutar
2. **Konu Çıkarımı**: En sık kullanılan kelimeleri "ilgi alanları" olarak kabul eder
3. **Bağlamsal Yanıtlar**: Uzun konuşmalarda önceki konulara atıfta bulunur

### Kişiselleştirme Seviyeleri

1. **Temel**: Kullanıcı adıyla hitap etme
2. **Duygusal**: Duygusal duruma göre yanıt verme
3. **Bağlamsal**: Geçmiş konuşmaları hatırlama
4. **Tahmine Dayalı**: Kullanıcı ilgi alanlarına göre öneriler

## Performans Optimizasyonları

### Animasyonlar
- `useNativeDriver: true` kullanarak native tarafta animasyon
- Reanimated kütüphanesi ile smooth animasyonlar

### Veri Yönetimi
- AsyncStorage ile asenkron okuma/yazma
- Lazy loading için pagination hazırlığı
- Konuşma geçmişi için sınırlı cache

### State Yönetimi
- React hooks ile minimal re-render
- Callback fonksiyonlar ile gereksiz render'ları önleme

## Güvenlik

### Veri Güvenliği
- Tüm veriler cihazda saklanır
- Sunucuya veri gönderilmez
- AsyncStorage şifrelenmemiş, hassas veri saklanmamalı

### Gizlilik
- Kullanıcı onayı ile veri öğrenme
- İstediği zaman tüm verileri silme imkanı
- Kişisel veri toplama ayarları

## Gelecek Geliştirmeler

### Teknik İyileştirmeler
1. Gerçek NLP API entegrasyonu (GPT, Claude, vb.)
2. Vektör database ile semantik arama
3. Ses tanıma (Speech-to-Text)
4. Push notification sistemi
5. Cloud senkronizasyonu (optional)

### Özellik Geliştirmeleri
1. Daha gelişmiş duygusal analiz
2. Kullanıcı ruh hali takibi
3. Günlük/haftalık duygusal raporlar
4. Fotoğraf ve medya paylaşımı
5. Çoklu avatar temaları
6. Sesli asistan modu

### UI/UX İyileştirmeleri
1. Daha gerçekçi 3D avatar (Three.js, React Native Skia)
2. Haptic feedback
3. Dark/Light mode geçişi
4. Daha fazla animasyon
5. Gesture kontrolleri

## Test Stratejisi

### Unit Tests
- AIService fonksiyonları
- StorageService CRUD operasyonları
- Utility fonksiyonları

### Component Tests
- Avatar animasyonları
- ChatInput validasyonları
- Message rendering

### Integration Tests
- Mesaj gönderme akışı
- Veri saklama ve yükleme
- Navigation akışları

### E2E Tests
- Tam kullanıcı senaryoları
- Multi-screen akışlar

## Bağımlılıklar ve Versiyonlar

### Ana Bağımlılıklar
- react-native: 0.73.0
- react-native-paper: 5.11.0
- @react-navigation: 6.x
- typescript: 5.0.4

### Native Modüller
- react-native-voice: Ses girişi
- react-native-tts: Ses sentezi
- @react-native-async-storage/async-storage: Veri saklama

## Sonuç

Süpperajan, modern mobil uygulama geliştirme prensiplerini takip eden, kullanıcı odaklı ve ölçeklenebilir bir mimari sunar. Basit başlayıp, gelecekte daha karmaşık AI entegrasyonlarına hazırdır.
