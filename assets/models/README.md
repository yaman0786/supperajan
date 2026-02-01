# 3D Avatar Models

Bu klasör, Süpperajan uygulamasında kullanılacak 3D GLB avatar modellerini içerir.

## Dizin Yapısı

```
assets/models/
├── README.md (bu dosya)
├── avatar-default.glb (varsayılan avatar - eklenecek)
└── [kullanıcı modelleri]
```

## GLB Model Ekleme

### 1. Model Gereksinimleri

- **Format**: .glb (binary) veya .gltf
- **Boyut**: Maksimum 5MB (mobil performans için)
- **Polygon**: 10,000 - 50,000 arası
- **Texture**: 1024x1024 veya 2048x2048
- **Animasyonlar**: İsteğe bağlı (idle, talking, wave, nod)

### 2. Modelinizi Ekleyin

Modelinizi bu klasöre kopyalayın:

```bash
cp /path/to/your/model.glb assets/models/my-avatar.glb
```

### 3. Kodu Güncelleyin

```typescript
// src/screens/ChatScreen.tsx
const avatarConfig = {
  use3D: true,
  modelPath: require('../../assets/models/my-avatar.glb'),
  fallbackTo2D: true,
};
```

## Örnek Modeller

### Nereden Bulunur?

1. **Ready Player Me**: https://readyplayer.me/
   - Özelleştirilebilir avatarlar
   - Ücretsiz GLB export

2. **Sketchfab**: https://sketchfab.com/
   - Binlerce ücretsiz model
   - "Downloadable" filtresi ile arayın

3. **Mixamo**: https://www.mixamo.com/
   - Adobe'nin ücretsiz karakter kütüphanesi
   - FBX'den GLB'ye dönüştürme gerekir

## Model Optimizasyonu

### Blender ile Export

1. File → Export → glTF 2.0
2. Ayarlar:
   - Format: GLB
   - Include: Selected Objects
   - Transform: +Y Up
   - Compression: ON

### Komut Satırı ile Optimizasyon

```bash
# gltf-pipeline yükleyin
npm install -g gltf-pipeline

# Optimize edin
gltf-pipeline -i input.glb -o output.glb -d
```

## Model Yapısı

İyi bir avatar modeli şunları içermelidir:

```
Model Hiyerarşisi:
├── Root
│   ├── Armature (Skeleton - isteğe bağlı)
│   │   ├── Head
│   │   ├── Spine
│   │   └── Arms
│   ├── Body Mesh
│   │   ├── Material_Body
│   │   └── Material_Accessories
│   └── Animations (isteğe bağlı)
│       ├── Idle
│       ├── Talking
│       └── Gestures
```

## Test Etme

Modelinizi ekledikten sonra:

1. Uygulamayı başlatın: `npm run android` / `npm run ios`
2. Avatar bölümünü kontrol edin
3. Console'da hata mesajlarını inceleyin
4. Jestlerin ve animasyonların çalıştığını test edin

## Sorun Giderme

### Model görünmüyor
- Dosya yolunu kontrol edin
- Metro bundler'ı yeniden başlatın: `npm start -- --reset-cache`
- GLB dosyasının bozuk olmadığını doğrulayın

### Performans düşük
- Polygon sayısını azaltın
- Texture boyutunu küçültün
- Animasyon karmaşıklığını azaltın

### Renkler yanlış
- Material ayarlarını kontrol edin
- PBR workflow kullandığınızdan emin olun
- Emissive channel'ı ayarlayın

## Lisanslama

Bu klasöre eklediğiniz modellerin lisansına dikkat edin:
- Kişisel projeler için: Lisanslı modeller kullanabilirsiniz
- Ticari kullanım: Ticari lisansa sahip modeller gerekir
- Açık kaynak: CC0 veya CC-BY lisanslı modeller tercih edin

## Yardım

Daha fazla bilgi için: [GLB_AVATAR_GUIDE.md](../../GLB_AVATAR_GUIDE.md)
