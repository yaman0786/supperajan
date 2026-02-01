# GLB Avatar Örnek Kullanım

## Hızlı Başlangıç

### 1. GLB Modeli İndirin

Ücretsiz bir avatar modeli indirin:

**Ready Player Me** (Önerilir):
1. https://readyplayer.me/ adresine gidin
2. Avatar oluşturun (ücretsiz)
3. "Download" → "GLB" formatını seçin
4. Dosyayı indirin (örn: `my-avatar.glb`)

**veya Sketchfab'dan**:
1. https://sketchfab.com/ adresine gidin
2. "robot" veya "character" arayın
3. "Downloadable" filtresi uygulayın
4. GLB formatında indirin

### 2. Modeli Projeye Ekleyin

```bash
# GLB dosyanızı assets/models klasörüne kopyalayın
cp ~/Downloads/my-avatar.glb assets/models/my-avatar.glb
```

### 3. Kodu Güncelleyin

**src/screens/ChatScreen.tsx** dosyasını açın ve `avatarConfig` state'ini güncelleyin:

```typescript
// Satır 36-41 civarında:
const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>({
  use3D: true,  // 3D avatar'ı aktif et
  fallbackTo2D: true,  // Yükleme başarısız olursa 2D kullan
  modelPath: require('../../assets/models/my-avatar.glb'),  // Model yolunuz
});
```

### 4. Uygulamayı Çalıştırın

```bash
# Metro bundler'ı temizle ve yeniden başlat
npm start -- --reset-cache

# Android'de çalıştır
npm run android

# veya iOS'ta
npm run ios
```

## Örnek Modeller

### Robot Avatar

```typescript
// Basit robot modeli örneği
const avatarConfig = {
  use3D: true,
  modelPath: require('../../assets/models/robot.glb'),
  fallbackTo2D: true,
};
```

### İnsan Avatar

```typescript
// Ready Player Me avatarı
const avatarConfig = {
  use3D: true,
  modelPath: require('../../assets/models/rpm-avatar.glb'),
  fallbackTo2D: true,
};
```

### URL'den Yükleme

```typescript
// Uzak sunucudan model yükleme
const avatarConfig = {
  use3D: true,
  modelPath: 'https://models.readyplayer.me/64f8c5b8e.glb',
  fallbackTo2D: true,
};
```

## Dinamik Model Değiştirme

Kullanıcının farklı modeller arasında seçim yapması için:

```typescript
const [selectedModel, setSelectedModel] = useState('robot');

const models = {
  robot: require('../../assets/models/robot.glb'),
  human: require('../../assets/models/human.glb'),
  alien: require('../../assets/models/alien.glb'),
};

const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>({
  use3D: true,
  modelPath: models[selectedModel],
  fallbackTo2D: true,
});

// Model değiştirme
const changeModel = (modelName: string) => {
  setSelectedModel(modelName);
  setAvatarConfig(prev => ({
    ...prev,
    modelPath: models[modelName],
  }));
};
```

## Ayarlar Ekranına Model Seçimi Ekleme

**src/screens/SettingsScreen.tsx** dosyasına model seçimi ekleyin:

```typescript
// Import ekleyin
import DocumentPicker from 'react-native-document-picker';

// Component içinde
const [use3DAvatar, setUse3DAvatar] = useState(false);
const [avatarModelPath, setAvatarModelPath] = useState('');

const handleSelectModel = async () => {
  try {
    const result = await DocumentPicker.pick({
      type: [DocumentPicker.types.allFiles],
    });
    
    if (result[0].name.endsWith('.glb') || result[0].name.endsWith('.gltf')) {
      setAvatarModelPath(result[0].uri);
      await StorageService.savePreferences({
        ...preferences,
        avatarModelPath: result[0].uri,
        use3DAvatar: true,
      });
    } else {
      Alert.alert('Hata', 'Lütfen GLB veya GLTF dosyası seçin');
    }
  } catch (err) {
    if (!DocumentPicker.isCancel(err)) {
      console.error('Model seçme hatası:', err);
    }
  }
};

// UI'da
<List.Item
  title="3D Avatar Kullan"
  description="Kendi GLB modelinizi yükleyin"
  left={props => <List.Icon {...props} icon="cube-outline" />}
  right={() => (
    <Switch
      value={use3DAvatar}
      onValueChange={setUse3DAvatar}
    />
  )}
/>

{use3DAvatar && (
  <Button mode="outlined" onPress={handleSelectModel}>
    GLB Model Seç
  </Button>
)}
```

## Test Etme

### 1. Model Görünüyor mu?

Avatar bölümünde modelin render edildiğini görmeli siniz.

### 2. Animasyonlar Çalışıyor mu?

- Mesaj gönderin → Avatar "dinliyor" jestine geçmeli
- Yanıt gelince → "konuşuyor" animasyonu başlamalı
- Duygusal durumlar → Renk değişmeli

### 3. Console Logları

Sorun varsa console'da hata mesajlarını kontrol edin:

```bash
# Android logları
adb logcat | grep -i "GLB\|Avatar\|Three"

# iOS logları
# Xcode'da console'u açın
```

## Sorun Giderme

### Model Görünmüyor

**Neden**: Dosya yolu yanlış olabilir
**Çözüm**:
```bash
# Dosyanın var olduğunu kontrol edin
ls -la assets/models/

# Metro bundler'ı temizleyin
npm start -- --reset-cache
```

### Sadece Siyah Ekran

**Neden**: WebGL rendering hatası
**Çözüm**: 2D avatar'a fallback yapıldı, console'da hatayı kontrol edin

### Çok Yavaş

**Neden**: Model çok karmaşık olabilir
**Çözüm**:
- Polygon sayısını azaltın (Blender'da Decimate modifier)
- Texture boyutunu küçültün
- 2D avatar kullanın

### Renkler Garip

**Neden**: Material ayarları uyumsuz olabilir
**Çözüm**:
- PBR (Physically Based Rendering) workflow kullanın
- Metallic/Roughness değerlerini ayarlayın
- Blender'da export öncesi materyalleri kontrol edin

## Gelişmiş Kullanım

### Animasyon Kontrolü

GLB modelinizde özel animasyonlar varsa:

```typescript
// Avatar3D.tsx içinde
if (gltf.animations && gltf.animations.length > 0) {
  mixerRef.current = new AnimationMixer(model);
  
  // İsme göre animasyon seç
  const talkingAnimation = gltf.animations.find(
    anim => anim.name === 'Talking'
  );
  
  if (talkingAnimation && state.lipSyncActive) {
    const action = mixerRef.current.clipAction(talkingAnimation);
    action.play();
  }
}
```

### Özel Shader'lar

Daha gelişmiş görsel efektler için:

```typescript
import { ShaderMaterial } from 'three';

const customMaterial = new ShaderMaterial({
  uniforms: {
    time: { value: 0 },
    emotionalColor: { value: new Color(emotionalColor) },
  },
  vertexShader: `...`,
  fragmentShader: `...`,
});
```

## Yardım ve Destek

- **Detaylı Rehber**: [GLB_AVATAR_GUIDE.md](GLB_AVATAR_GUIDE.md)
- **Model Gereksinimleri**: [assets/models/README.md](assets/models/README.md)
- **GitHub Issues**: Sorun bildirin
- **Topluluk**: Discord/Slack kanallarına katılın

## Örnek Projeler

### Minimal Örnek

```typescript
import Avatar from '../components/Avatar';

function App() {
  const avatarState = {
    expression: 'smile',
    gesture: 'wave',
    lipSyncActive: false,
    emotionalTone: 'happy',
  };

  return (
    <Avatar
      state={avatarState}
      config={{
        use3D: true,
        modelPath: require('./assets/robot.glb'),
        fallbackTo2D: true,
      }}
    />
  );
}
```

### Tam Örnek (ChatScreen)

Mevcut `src/screens/ChatScreen.tsx` dosyası tam bir çalışan örnek içerir.

## Sonraki Adımlar

1. ✅ GLB model ekleyin
2. ✅ Uygulamayı test edin
3. 📝 Kendi modelinizi oluşturun (Blender)
4. 🎨 Materyalleri özelleştirin
5. 🎭 Özel animasyonlar ekleyin
6. 🚀 Uygulamanızı yayınlayın!

Başarılar! 🎉
