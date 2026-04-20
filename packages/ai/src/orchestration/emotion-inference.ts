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
 * Designed to be extended with ML-based scoring in later phases.
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

  // Excited positive signals
  if (matchesAny(msgLower, EXCITEMENT_SIGNALS)) return 'excited';

  // Question/curiosity signals
  if (msgLower.endsWith('?') || matchesAny(msgLower, CURIOSITY_SIGNALS)) return 'curious';

  // Task-based overrides
  if (taskType === 'research') return 'thinking';
  if (taskType === 'emotional') return 'empathetic';
  if (taskType === 'greeting') return 'happy';

  // Response-based inference
  if (assistantResponse) {
    if (matchesAny(responseLower, CELEBRATORY_SIGNALS)) return 'excited';
    if (matchesAny(responseLower, ALERT_SIGNALS)) return 'alert';
  }

  // Maintain previous emotion with decay toward calm
  if (previousEmotion && previousEmotion !== 'idle') return 'calm';

  return 'idle';
}

/**
 * Determines if a response warrants a surprised reaction.
 */
export function shouldTriggerSurprise(userMessage: string): boolean {
  return matchesAny(userMessage.toLowerCase(), SURPRISE_TRIGGERS);
}

function matchesAny(text: string, patterns: string[]): boolean {
  return patterns.some((p) => text.includes(p));
}

const DISTRESS_SIGNALS = [
  'sad', 'depressed', 'anxious', 'scared', 'overwhelmed', 'stressed',
  'hopeless', 'terrible', 'awful', 'crying', 'upset', 'hurt', 'afraid',
  'worried', 'lost', 'alone', 'struggling',
];

const GREETING_SIGNALS = [
  'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening',
  'howdy', 'what\'s up', 'sup',
];

const FAREWELL_SIGNALS = [
  'bye', 'goodbye', 'see you', 'take care', 'goodnight', 'good night',
  'talk later', 'catch you later',
];

const EXCITEMENT_SIGNALS = [
  '!', 'amazing', 'awesome', 'excited', 'great news', 'fantastic',
  'wonderful', 'incredible', 'love it', 'perfect', 'yes!',
];

const CURIOSITY_SIGNALS = [
  'what is', 'how does', 'why does', 'tell me about', 'explain',
  'curious', 'wondering', 'i wonder', 'what about',
];

const CELEBRATORY_SIGNALS = [
  'congratulations', 'well done', 'great job', 'achievement', 'success',
];

const ALERT_SIGNALS = [
  'warning', 'caution', 'important', 'urgent', 'critical', 'alert',
  'be careful', 'watch out',
];

const SURPRISE_TRIGGERS = [
  'surprisingly', 'unexpectedly', 'shocking', 'wow', 'unbelievable',
  'can\'t believe', 'no way', 'really?',
];
