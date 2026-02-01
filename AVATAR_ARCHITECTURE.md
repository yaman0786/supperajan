# Avatar Sistemi Mimarisi

## Sistem Genel Bakış

```
┌─────────────────────────────────────────────────────┐
│                   ChatScreen                        │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │         Avatar Component (Main)               │ │
│  │                                               │ │
│  │  Props:                                       │ │
│  │  - state: AvatarState                        │ │
│  │  - config: AvatarConfig                      │ │
│  │  - isAnimating: boolean                      │ │
│  └───────────────┬───────────────────────────────┘ │
│                  │                                  │
└──────────────────┼──────────────────────────────────┘
                   │
                   ▼
      ┌────────────────────────┐
      │   AvatarWrapper        │
      │  (Smart Switcher)      │
      │                        │
      │  Checks config.use3D   │
      │  Handles fallback      │
      └───────┬───────┬────────┘
              │       │
       use3D: true    use3D: false
              │       │
              │       │
    ┌─────────▼───┐  │  ┌──────▼─────────┐
    │  Avatar3D   │  │  │   Avatar2D     │
    │  Component  │  │  │   Component    │
    │             │  │  │                │
    │  - GLB      │  └──│  - React       │
    │  - WebGL    │     │    Native      │
    │  - Three.js │     │  - 2D Views    │
    └─────────────┘     └────────────────┘
```

## Bileşen Detayları

### 1. Avatar Component (Main Export)

**Dosya**: `src/components/Avatar.tsx`

```typescript
export { default } from './AvatarWrapper';
export { default as Avatar2D } from './Avatar2D';
export { default as Avatar3D } from './Avatar3D';
```

**Rol**: Ana export noktası, bileşenleri dışa aktarır.

### 2. AvatarWrapper

**Dosya**: `src/components/AvatarWrapper.tsx`

**Sorumluluklar**:
- Config'e göre 2D veya 3D avatar seçimi
- Otomatik fallback yönetimi
- Hata yakalama ve işleme

**Karar Ağacı**:
```
config.use3D?
├─ Yes → Avatar3D'yi render et
│         └─ GLB load başarılı?
│            ├─ Yes → 3D avatar göster
│            └─ No → config.fallbackTo2D?
│                    ├─ Yes → Avatar2D'ye geç
│                    └─ No → Hata göster
└─ No → Avatar2D'yi render et
```

**Kod Örneği**:
```typescript
const AvatarWrapper: React.FC<AvatarWrapperProps> = ({
  state,
  config = { use3D: false, fallbackTo2D: true },
}) => {
  const shouldUse2D = !config.use3D || 
                      (modelLoadError && config.fallbackTo2D);
  
  if (shouldUse2D) {
    return <Avatar2D state={state} />;
  }
  
  return <Avatar3D state={state} modelPath={config.modelPath} />;
};
```

### 3. Avatar2D (Orijinal)

**Dosya**: `src/components/Avatar2D.tsx`

**Teknoloji**:
- React Native View/Animated
- StyleSheet
- 2D transforms

**Özellikler**:
```
Avatar2D
├── Glow Effect (Animated)
├── Head
│   ├── Eyes (2x)
│   └── Mouth (5 expressions)
├── Body
│   └── Neon Lines (3x)
└── Gestures (Transforms)
```

**Animasyonlar**:
- Glow pulse: 1500ms döngü
- Gestures: rotation, scale
- Lip sync: scale animation

### 4. Avatar3D (Yeni)

**Dosya**: `src/components/Avatar3D.tsx`

**Teknoloji**:
- expo-gl (WebGL)
- expo-three (Three.js wrapper)
- Three.js (3D engine)
- GLTFLoader (Model loader)

**Özellikler**:
```
Avatar3D
├── GLView (WebGL Context)
├── Scene
│   ├── Lights
│   │   ├── AmbientLight
│   │   ├── DirectionalLight
│   │   └── RimLight (Neon)
│   ├── Camera (Perspective)
│   └── Model (GLB/GLTF)
│       ├── Mesh
│       ├── Materials
│       └── Animations
└── AnimationMixer
```

**Rendering Pipeline**:
```
1. onContextCreate()
   ├─ Create Renderer (WebGL)
   ├─ Setup Scene
   ├─ Add Lights
   ├─ Load GLB Model
   │   └─ GLTFLoader.load()
   └─ Start Animation Loop

2. render() Loop (60 FPS)
   ├─ Update AnimationMixer
   ├─ Apply Avatar State
   │   ├─ Gestures (rotation, scale)
   │   ├─ Lip Sync (scale)
   │   └─ Emotional Color (emissive)
   ├─ Renderer.render()
   └─ gl.endFrameEXP()
```

## Veri Akışı

### AvatarState (Her İki Avatar İçin)

```typescript
interface AvatarState {
  expression: 'smile' | 'neutral' | 'concerned' | 'excited' | 'thinking';
  gesture: 'wave' | 'nod' | 'idle' | 'listening' | 'speaking';
  lipSyncActive: boolean;
  emotionalTone: EmotionalTone;
}
```

**2D Avatar'da Kullanım**:
- expression → Ağız şekli (View component)
- gesture → Transform animasyonu (rotation, scale)
- lipSyncActive → Scale pulse animasyonu
- emotionalTone → Gözler ve glow rengi

**3D Avatar'da Kullanım**:
- expression → (Morph targets - gelecek özellik)
- gesture → Model rotation/position
- lipSyncActive → Model scale pulse
- emotionalTone → Material emissive color

### AvatarConfig

```typescript
interface AvatarConfig {
  use3D: boolean;           // 3D kullan mı?
  modelPath?: string;       // GLB dosya yolu
  fallbackTo2D?: boolean;   // Hata durumunda 2D'ye geç
}
```

**Config Örnekleri**:

```typescript
// Sadece 2D
{ use3D: false }

// 3D (yerel model)
{
  use3D: true,
  modelPath: require('../../assets/models/robot.glb'),
  fallbackTo2D: true
}

// 3D (URL)
{
  use3D: true,
  modelPath: 'https://example.com/avatar.glb',
  fallbackTo2D: true
}
```

## İletişim Akışı

### ChatScreen → Avatar

```
ChatScreen State
├─ avatarState (AvatarState)
│   ├─ expression
│   ├─ gesture
│   ├─ lipSyncActive
│   └─ emotionalTone
│
└─ avatarConfig (AvatarConfig)
    ├─ use3D
    ├─ modelPath
    └─ fallbackTo2D

         ↓

Avatar Component
         ↓
    AvatarWrapper
    ├─ Checks use3D
    ├─ Handles errors
    └─ Routes to correct component
         ↓
    Avatar2D or Avatar3D
         ↓
    Renders based on state
```

### Duygusal Renk Akışı

```
AI Response
├─ emotionalTone: 'happy'
│
↓
ChatScreen
├─ setAvatarState({ emotionalTone: 'happy' })
│
↓
Avatar Component
├─ getEmotionalColor('happy') → '#FFD700'
│
↓ 2D Avatar          ↓ 3D Avatar
├─ Eye color         ├─ Material emissive
└─ Glow color        └─ Emissive intensity
```

## Dosya Yapısı

```
src/
├── components/
│   ├── Avatar.tsx           # Main export
│   ├── AvatarWrapper.tsx    # Smart switcher
│   ├── Avatar2D.tsx         # 2D implementation
│   ├── Avatar3D.tsx         # 3D implementation
│   ├── ChatInput.tsx
│   └── ChatMessageList.tsx
│
├── screens/
│   └── ChatScreen.tsx       # Avatar kullanımı
│
├── types/
│   └── index.ts            # AvatarState, AvatarConfig
│
└── config/
    └── theme.ts            # Renk paleti

assets/
└── models/
    ├── README.md
    ├── robot.glb
    └── [user models]
```

## Performans Optimizasyonu

### 2D Avatar
- ✅ Native driver kullanımı
- ✅ Memoization
- ✅ Minimal re-renders
- **FPS**: ~60

### 3D Avatar
- ⚠️ WebGL overhead
- ⚠️ Model complexity bağımlı
- ✅ GPU accelerated
- **FPS**: 30-60 (model complexity'e göre)

### Optimizasyon Stratejileri

```
Dosya Boyutu:
├─ GLB compression
├─ Texture optimization
└─ Polygon reduction

Rendering:
├─ Frustum culling
├─ Level of Detail (LOD)
└─ Texture mipmaps

Memory:
├─ Model caching
├─ Texture pooling
└─ Animation reuse
```

## Hata Yönetimi

```
Hata Senaryoları:

1. GLB Yükleme Hatası
   ├─ Try: GLTFLoader.load()
   ├─ Catch: console.error()
   └─ Fallback: Avatar2D

2. WebGL Desteklenmiyor
   ├─ Check: expo-gl available?
   ├─ No → Avatar2D
   └─ Yes → Avatar3D

3. Model Formatı Yanlış
   ├─ Validate: .glb or .gltf?
   ├─ Invalid → Error + Avatar2D
   └─ Valid → Load

4. Performance Issues
   ├─ Monitor: FPS < 30?
   ├─ Yes → Switch to Avatar2D
   └─ No → Continue 3D
```

## Test Stratejisi

### Unit Tests
```typescript
describe('AvatarWrapper', () => {
  it('renders 2D when use3D is false', () => {
    const config = { use3D: false };
    // Assert Avatar2D rendered
  });

  it('renders 3D when use3D is true', () => {
    const config = { use3D: true, modelPath: 'test.glb' };
    // Assert Avatar3D rendered
  });

  it('falls back to 2D on error', () => {
    const config = { use3D: true, fallbackTo2D: true };
    // Simulate error, assert Avatar2D
  });
});
```

### Integration Tests
```typescript
describe('Avatar in ChatScreen', () => {
  it('responds to emotional state changes', () => {
    // Change emotionalTone
    // Assert color change
  });

  it('animates on gesture change', () => {
    // Change gesture
    // Assert animation
  });
});
```

## Gelecek Geliştirmeler

### Planlanan Özellikler

1. **Morph Targets**
   ```typescript
   // Yüz ifadeleri için blendshapes
   model.morphTargetInfluences[0] = smileIntensity;
   ```

2. **Physics**
   ```typescript
   // Fizik simülasyonu
   import { Physics } from '@react-three/rapier';
   ```

3. **Custom Shaders**
   ```glsl
   // Özel shader efektleri
   uniform vec3 emotionalColor;
   uniform float time;
   ```

4. **AR Support**
   ```typescript
   // Augmented Reality
   import { ARView } from 'expo-ar';
   ```

## Sonuç

Avatar sistemi modüler, extensible ve performanslı bir yapıya sahiptir. 2D ve 3D avatar'lar arasında sorunsuz geçiş yapabilir, gelecekteki geliştirmelere açıktır.

**Temel Prensipler**:
- ✅ Separation of Concerns
- ✅ Fallback Mechanism
- ✅ Performance First
- ✅ User Choice
