import type { EmotionState } from '@supperajan/types';

export interface EmotionInferenceContext {
  userMessage: string;
  assistantResponse?: string;
  taskType?: 'question' | 'task' | 'emotional' | 'research' | 'greeting' | 'farewell' | 'correction';
  previousEmotion?: EmotionState;
}

/**
 * Rule-based emotion inference engine.
 * Maps conversation signals to avatar emotion states.
 * Supports both Turkish and English signals.
 */
export function inferEmotion(context: EmotionInferenceContext): EmotionState {
  const { userMessage, assistantResponse, taskType, previousEmotion } = context;
  const msgLower = userMessage.toLowerCase();
  const responseLower = (assistantResponse ?? '').toLowerCase();

  // Distress signals → empathetic
  if (matchesAny(msgLower, DISTRESS_SIGNALS)) return 'empathetic';

  // Greetings → happy
  if (matchesAny(msgLower, GREETING_SIGNALS)) return 'happy';

  // Farewell → calm
  if (matchesAny(msgLower, FAREWELL_SIGNALS)) return 'calm';

  // Excitement signals → excited
  if (matchesAny(msgLower, EXCITEMENT_SIGNALS)) return 'excited';

  // Surprise triggers
  if (matchesAny(msgLower, SURPRISE_TRIGGERS)) return 'surprised';

  // Question/curiosity signals
  if (msgLower.endsWith('?') || matchesAny(msgLower, CURIOSITY_SIGNALS)) return 'curious';

  // Task-based overrides
  if (taskType === 'research') return 'curious';
  if (taskType === 'emotional') return 'empathetic';
  if (taskType === 'greeting') return 'happy';

  // Response-based inference
  if (assistantResponse) {
    if (matchesAny(responseLower, CELEBRATORY_SIGNALS)) return 'excited';
    if (matchesAny(responseLower, ALERT_SIGNALS)) return 'alert';
    if (matchesAny(responseLower, EMPATHETIC_RESPONSE_SIGNALS)) return 'empathetic';
  }

  // Maintain previous emotion with decay toward idle
  if (previousEmotion && previousEmotion !== 'idle' && previousEmotion !== 'thinking') {
    return 'idle';
  }

  return 'idle';
}

export function shouldTriggerSurprise(userMessage: string): boolean {
  return matchesAny(userMessage.toLowerCase(), SURPRISE_TRIGGERS);
}

function matchesAny(text: string, patterns: string[]): boolean {
  return patterns.some((p) => text.includes(p));
}

// ── English signals ────────────────────────────────────────────────────────

const DISTRESS_SIGNALS_EN = [
  'sad', 'depressed', 'anxious', 'scared', 'overwhelmed', 'stressed',
  'hopeless', 'terrible', 'awful', 'crying', 'upset', 'hurt', 'afraid',
  'worried', 'lost', 'alone', 'struggling', 'exhausted', 'desperate',
];

const GREETING_SIGNALS_EN = [
  'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening',
  'howdy', "what's up", 'sup', 'greetings',
];

const FAREWELL_SIGNALS_EN = [
  'bye', 'goodbye', 'see you', 'take care', 'goodnight', 'good night',
  'talk later', 'catch you later', 'farewell', 'until next time',
];

const EXCITEMENT_SIGNALS_EN = [
  'amazing', 'awesome', 'excited', 'great news', 'fantastic', 'wonderful',
  'incredible', 'love it', 'perfect', 'brilliant', 'outstanding', 'excellent',
];

const CURIOSITY_SIGNALS_EN = [
  'what is', 'how does', 'why does', 'tell me about', 'explain',
  'curious', 'wondering', 'i wonder', 'what about', 'how do', 'can you explain',
];

const SURPRISE_TRIGGERS_EN = [
  'surprisingly', 'unexpectedly', 'shocking', 'wow', 'unbelievable',
  "can't believe", 'no way', 'really?', 'seriously?', 'what?!',
];

const CELEBRATORY_SIGNALS_EN = [
  'congratulations', 'well done', 'great job', 'achievement', 'success',
  "you're right", 'exactly', 'spot on',
];

const ALERT_SIGNALS_EN = [
  'warning', 'caution', 'important', 'urgent', 'critical', 'alert',
  'be careful', 'watch out', 'danger', 'error',
];

const EMPATHETIC_RESPONSE_SIGNALS_EN = [
  'i understand', "that's difficult", 'i hear you', "that's hard",
  'i can imagine', 'sounds tough', 'i feel for you',
];

// ── Turkish signals ────────────────────────────────────────────────────────

const DISTRESS_SIGNALS_TR = [
  'üzgün', 'üzüldüm', 'depresif', 'kaygılı', 'endişeli', 'korkmuş', 'korkuyorum',
  'bunaldım', 'stresli', 'stres', 'umutsuz', 'korkunç', 'berbat', 'ağlıyorum',
  'zarar', 'acı', 'yalnız', 'kayboldum', 'yardım lazım', 'dayanamıyorum',
  'bitkin', 'yoruldum', 'çaresiz', 'mutsuz', 'perişan', 'mahvoldum',
];

const GREETING_SIGNALS_TR = [
  'merhaba', 'selam', 'günaydın', 'iyi günler', 'iyi akşamlar',
  'nasılsın', 'naber', 'hey', 'selamlar', 'merhabalar',
];

const FAREWELL_SIGNALS_TR = [
  'hoşça kal', 'güle güle', 'görüşürüz', 'kendine iyi bak', 'iyi geceler',
  'sonra görüşürüz', 'bay bay', 'görüşmek üzere', 'elveda',
];

const EXCITEMENT_SIGNALS_TR = [
  'harika', 'mükemmel', 'muhteşem', 'inanılmaz', 'süper', 'müthiş',
  'çok güzel', 'çok sevdim', 'bravo', 'tebrikler', 'şahane', 'fevkalade',
  'heyecanlandım', 'bayıldım', 'nefis', 'enfes',
];

const CURIOSITY_SIGNALS_TR = [
  'nedir', 'nasıl', 'neden', 'niçin', 'açıkla', 'anlat', 'merak ediyorum',
  'acaba', 'ne demek', 'nasıl çalışır', 'söyler misin', 'neden böyle',
  'ne zaman', 'nerede', 'kim', 'hangi',
];

const SURPRISE_TRIGGERS_TR = [
  'şaşırdım', 'inanılmaz', 'gerçekten mi', 'vay be', 'yok artık',
  'olamaz', 'mümkün mü', 'şok oldum', 'beklemiyordum', 'sürpriz',
];

const CELEBRATORY_SIGNALS_TR = [
  'aferin', 'tebrikler', 'bravo', 'süper', 'harika', 'güzel iş',
  'başardım', 'oldu', 'hallettim',
];

const ALERT_SIGNALS_TR = [
  'dikkat', 'uyarı', 'tehlike', 'önemli', 'acil', 'hata', 'sorun',
  'problem', 'yanlış', 'bozuk',
];

const EMPATHETIC_RESPONSE_SIGNALS_TR = [
  'anlıyorum', 'zor bir durum', 'seni duyuyorum', 'empati', 'üzüldüm',
  'geçmiş olsun', 'başın sağ', 'kolay gelsin',
];

// ── Combined signal sets ──────────────────────────────────────────────────

const DISTRESS_SIGNALS    = [...DISTRESS_SIGNALS_EN,    ...DISTRESS_SIGNALS_TR];
const GREETING_SIGNALS    = [...GREETING_SIGNALS_EN,    ...GREETING_SIGNALS_TR];
const FAREWELL_SIGNALS    = [...FAREWELL_SIGNALS_EN,    ...FAREWELL_SIGNALS_TR];
const EXCITEMENT_SIGNALS  = [...EXCITEMENT_SIGNALS_EN,  ...EXCITEMENT_SIGNALS_TR];
const CURIOSITY_SIGNALS   = [...CURIOSITY_SIGNALS_EN,   ...CURIOSITY_SIGNALS_TR];
const SURPRISE_TRIGGERS   = [...SURPRISE_TRIGGERS_EN,   ...SURPRISE_TRIGGERS_TR];
const CELEBRATORY_SIGNALS = [...CELEBRATORY_SIGNALS_EN, ...CELEBRATORY_SIGNALS_TR];
const ALERT_SIGNALS       = [...ALERT_SIGNALS_EN,       ...ALERT_SIGNALS_TR];
const EMPATHETIC_RESPONSE_SIGNALS = [
  ...EMPATHETIC_RESPONSE_SIGNALS_EN,
  ...EMPATHETIC_RESPONSE_SIGNALS_TR,
];
