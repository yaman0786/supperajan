# GLB 3D Avatar Kullanım Rehberi

## Genel Bakış

Süpperajan uygulaması artık gerçek 3D GLB model dosyalarını avatar olarak kullanma özelliğini desteklemektedir. Bu rehber, 3D avatar modellerini nasıl ekleyeceğinizi ve kullanacağınızını açıklar.

## GLB Dosyası Nedir?

GLB (GL Transmission Format Binary), 3D modellerin, animasyonların, materyallerin ve dokuların tek bir dosyada saklanmasını sağlayan bir formattır. WebGL ve mobil uygulamalarda yaygın olarak kullanılır.

## Gereksinimler

### GLB Model Gereksinimleri

1. **Dosya Formatı**: `.glb` veya `.gltf` (binary tercih edilir)
2. **Dosya Boyutu**: Mobil performans için 5MB altı önerilir
3. **Polygon Sayısı**: 10,000 - 50,000 polygon arası optimize edilmiş model
4. **Doku Boyutu**: 1024x1024 veya 2048x2048 maksimum
5. **Animasyonlar**: İsteğe bağlı (idle, talking, waving animasyonları eklenebilir)

### Model Yapısı

İdeal bir GLB avatar modeli şunları içermelidir:

```
Avatar GLB
├── Mesh (Geometri)
│   ├── Head (Kafa)
│   ├── Body (Gövde)
│   └── Arms (Kollar - isteğe bağlı)
├── Materials (Materyaller)
│   ├── Base Color
│   ├── Metallic/Roughness
│   └── Emissive (Neon efektler için)
└── Animations (İsteğe bağlı)
    ├── Idle
    ├── Talking
    ├── Wave
    └── Nod
```

## Kurulum ve Kullanım

### 1. Bağımlılıkları Yükleme

```bash
npm install
# veya
yarn install
```

Yeni eklenen paketler:
- `expo-gl`: WebGL renderer
- `expo-three`: Three.js için React Native desteği
- `three`: 3D grafik kütüphanesi
- `expo-asset`: Asset yönetimi

### 2. GLB Modelini Projeye Ekleme

#### Yerel Model Kullanımı

1. GLB dosyanızı `assets/models/` klasörüne kopyalayın:

```
assets/
└── models/
    ├── avatar-robot.glb
    ├── avatar-human.glb
    └── README.md
```

2. Model dosyasını import edin:

```typescript
// src/screens/ChatScreen.tsx içinde

const avatarModels = {
  robot: require('../../assets/models/avatar-robot.glb'),
  human: require('../../assets/models/avatar-human.glb'),
};
```

3. Avatar yapılandırmasını güncelleyin:

```typescript
const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>({
  use3D: true,
  fallbackTo2D: true,
  modelPath: avatarModels.robot, // veya URL
});
```

#### Uzak URL'den Model Yükleme

```typescript
const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>({
  use3D: true,
  fallbackTo2D: true,
  modelPath: 'https://example.com/models/avatar.glb',
});
```

### 3. Ayarlar Ekranında GLB Seçimi

Kullanıcının kendi GLB modelini seçmesi için Settings ekranını güncelleyin:

```typescript
// src/screens/SettingsScreen.tsx

import DocumentPicker from 'react-native-document-picker';

const handleSelectAvatarModel = async () => {
  try {
    const result = await DocumentPicker.pick({
      type: [DocumentPicker.types.allFiles],
    });
    
    if (result[0].name.endsWith('.glb') || result[0].name.endsWith('.gltf')) {
      // Model dosyasını kaydet
      await StorageService.savePreferences({
        ...preferences,
        avatarModelPath: result[0].uri,
        use3DAvatar: true,
      });
    }
  } catch (err) {
    console.error('Model seçme hatası:', err);
  }
};
```

## Özellikler

### Duygusal Renk Değişimi

3D avatar, duygusal duruma göre otomatik olarak renk tonu değiştirir:

```typescript
// Duygusal renkler
const emotionalColors = {
  happy: '#FFD700',    // Altın
  sad: '#4169E1',      // Mavi
  excited: '#FF1493',  // Pembe
  calm: '#00CED1',     // Turkuaz
  concerned: '#FF6347', // Domates
  neutral: '#00BFFF',  // Neon Mavi
};
```

Model materyallerinin `emissive` özelliği bu renklere göre ayarlanır.

### Animasyonlar

GLB modelinde animasyonlar varsa, otomatik olarak tespit edilir ve oynatılır:

- **Idle**: Varsayılan bekleme animasyonu
- **Talking**: Konuşma sırasında (lipSyncActive)
- **Wave**: El sallama jesti
- **Nod**: Başını sallama jesti

### Jestler

Avatar state'e göre model transformasyonları uygulanır:

```typescript
// Gesture animasyonları
switch (state.gesture) {
  case 'wave':
    model.rotation.y = Math.sin(Date.now() * 0.003) * 0.3;
    break;
  case 'nod':
    model.rotation.x = Math.sin(Date.now() * 0.005) * 0.2;
    break;
  case 'idle':
    model.position.y = Math.sin(Date.now() * 0.001) * 0.05;
    break;
}
```

## GLB Model Oluşturma

### Önerilen Araçlar

1. **Blender** (Ücretsiz, Açık Kaynak)
   - En popüler 3D modelleme yazılımı
   - GLB export built-in
   - https://www.blender.org/

2. **Ready Player Me** (Avatar Oluşturucu)
   - Hazır avatar modelleri
   - GLB export desteği
   - https://readyplayer.me/

3. **Mixamo** (Adobe - Ücretsiz)
   - Hazır karakterler ve animasyonlar
   - GLB formatına convert edilebilir
   - https://www.mixamo.com/

### Blender'da GLB Export

1. Modelinizi oluşturun veya import edin
2. File → Export → glTF 2.0 (.glb/.gltf)
3. Export ayarları:
   - Format: GLB (Binary)
   - Include: Selected Objects
   - Transform: +Y Up
   - Geometry: Apply Modifiers
   - Compression: ON (dosya boyutunu azaltır)

### Optimizasyon İpuçları

```bash
# GLB dosyasını optimize etme (gltf-pipeline kullanarak)
npm install -g gltf-pipeline

# Sıkıştırma
gltf-pipeline -i input.glb -o output.glb -d

# Texture boyutunu azaltma
gltf-pipeline -i input.glb -o output.glb --texcomp.pvrtc
```

## Performans İpuçları

1. **Model Karmaşıklığı**: 
   - Low-poly modeller tercih edin (10k-20k polygon)
   - LOD (Level of Detail) kullanın

2. **Texture Boyutu**:
   - 1024x1024 veya daha küçük dokular kullanın
   - Texture atlasları birleştirin

3. **Animasyonlar**:
   - Keyframe sayısını azaltın
   - Gereksiz animasyon kanallarını kaldırın

4. **Materyal Sayısı**:
   - Mümkün olduğunca az materyal kullanın
   - Materyalleri birleştirin

## Hata Ayıklama

### Model Yüklenmiyor

```typescript
// Console loglarını kontrol edin
console.log('Model yükleme hatası:', error);

// Fallback 2D kullanımını doğrulayın
config={{ use3D: true, fallbackTo2D: true }}
```

### Animasyonlar Çalışmıyor

1. GLB dosyasında animasyonların olduğundan emin olun
2. Blender'da animasyonların export edildiğini kontrol edin
3. AnimationMixer'ın doğru kurulduğunu doğrulayın

### Performans Sorunları

1. Polygon sayısını azaltın
2. Texture boyutlarını küçültün
3. 2D avatar'a geri dönün (fallback)

## Örnekler

### Basit 3D Avatar Kullanımı

```typescript
import Avatar from '../components/Avatar';

<Avatar
  state={{
    expression: 'smile',
    gesture: 'wave',
    lipSyncActive: false,
    emotionalTone: 'happy',
  }}
  config={{
    use3D: true,
    modelPath: require('../../assets/models/robot.glb'),
    fallbackTo2D: true,
  }}
/>
```

### Dinamik Model Değiştirme

```typescript
const [currentModel, setCurrentModel] = useState('robot');

const models = {
  robot: require('../../assets/models/robot.glb'),
  human: require('../../assets/models/human.glb'),
  alien: require('../../assets/models/alien.glb'),
};

<Avatar
  state={avatarState}
  config={{
    use3D: true,
    modelPath: models[currentModel],
    fallbackTo2D: true,
  }}
/>

<Button onPress={() => setCurrentModel('human')}>
  İnsan Avatar
</Button>
```

### URL'den Model Yükleme

```typescript
const [avatarUrl, setAvatarUrl] = useState('');

<Avatar
  state={avatarState}
  config={{
    use3D: true,
    modelPath: avatarUrl || undefined,
    fallbackTo2D: true,
  }}
/>

<TextInput
  value={avatarUrl}
  onChangeText={setAvatarUrl}
  placeholder="GLB model URL'sini girin"
/>
```

## Ücretsiz GLB Model Kaynakları

1. **Sketchfab** - https://sketchfab.com/
   - Binlerce ücretsiz 3D model
   - GLB download desteği

2. **Poly Haven** - https://polyhaven.com/
   - Ücretsiz, kaliteli modeller
   - CC0 lisans

3. **Ready Player Me** - https://readyplayer.me/
   - Özelleştirilebilir avatarlar
   - Ücretsiz GLB export

4. **Mixamo** - https://www.mixamo.com/
   - Adobe'nin ücretsiz karakter kütüphanesi
   - Animasyonlu karakterler

## Lisanslama

GLB model kullanırken lisans haklarına dikkat edin:
- **CC0**: Tamamen ücretsiz, atıf gerekmez
- **CC-BY**: Ücretsiz, atıf gereklidir
- **Personal Use**: Sadece kişisel projeler için
- **Commercial**: Ticari kullanım için lisans gerekir

## Destek

GLB avatar ile ilgili sorunlar için:
1. GitHub Issues'da sorun bildirin
2. Console loglarını ekleyin
3. Kullandığınız GLB model hakkında bilgi verin
4. Cihaz ve işletim sistemi bilgisi paylaşın

## İleri Seviye

### Custom Shader'lar

```typescript
// Avatar3D.tsx içinde custom shader kullanımı
import { ShaderMaterial } from 'three';

const customMaterial = new ShaderMaterial({
  vertexShader: `...`,
  fragmentShader: `...`,
  uniforms: {
    time: { value: 0 },
    color: { value: new Color(emotionalColor) },
  },
});
```

### Morph Targets (Blendshapes)

```typescript
// Yüz ifadeleri için morph target kontrolü
if (model.morphTargetInfluences) {
  model.morphTargetInfluences[0] = 0.5; // Smile
  model.morphTargetInfluences[1] = 0.3; // Blink
}
```

### Physics Simulation

```typescript
// react-three-rapier ile fizik simülasyonu
import { Physics, RigidBody } from '@react-three/rapier';
```

## Sonuç

3D GLB avatar desteği, Süpperajan uygulamasına daha gerçekçi ve özelleştirilebilir bir görünüm kazandırır. Bu rehberi takip ederek kendi 3D avatar modellerinizi kolayca ekleyebilir ve kullanabilirsiniz.

**Önemli Not**: 3D avatar yüklenirken veya çalışırken sorun yaşanırsa, uygulama otomatik olarak klasik 2D avatar'a geri döner (fallbackTo2D: true).
