import { describe, it, expect } from 'vitest';
import { inferEmotion, shouldTriggerSurprise } from './emotion-inference.js';

describe('inferEmotion', () => {
  describe('distress signals', () => {
    it('returns empathetic for English distress words', () => {
      expect(inferEmotion({ userMessage: 'I feel so sad today' })).toBe('empathetic');
      expect(inferEmotion({ userMessage: 'I am really stressed and overwhelmed' })).toBe('empathetic');
      expect(inferEmotion({ userMessage: 'feeling hopeless and alone' })).toBe('empathetic');
    });

    it('returns empathetic for Turkish distress words', () => {
      expect(inferEmotion({ userMessage: 'çok üzgün hissediyorum' })).toBe('empathetic');
      expect(inferEmotion({ userMessage: 'kaygılı ve yorgunum' })).toBe('empathetic');
      expect(inferEmotion({ userMessage: 'depresif hissediyorum' })).toBe('empathetic');
    });
  });

  describe('greeting signals', () => {
    it('returns happy for English greetings', () => {
      expect(inferEmotion({ userMessage: 'hello!' })).toBe('happy');
      expect(inferEmotion({ userMessage: 'hey, how are you?' })).toBe('happy');
      expect(inferEmotion({ userMessage: 'good morning' })).toBe('happy');
    });

    it('returns happy for Turkish greetings', () => {
      expect(inferEmotion({ userMessage: 'merhaba!' })).toBe('happy');
      expect(inferEmotion({ userMessage: 'selam, nasılsın?' })).toBe('happy');
      expect(inferEmotion({ userMessage: 'günaydın' })).toBe('happy');
    });
  });

  describe('farewell signals', () => {
    it('returns calm for English farewells', () => {
      expect(inferEmotion({ userMessage: 'bye!' })).toBe('calm');
      expect(inferEmotion({ userMessage: 'goodbye, see you later' })).toBe('calm');
    });

    it('returns calm for Turkish farewells', () => {
      expect(inferEmotion({ userMessage: 'hoşça kal' })).toBe('calm');
      expect(inferEmotion({ userMessage: 'görüşürüz' })).toBe('calm');
    });
  });

  describe('excitement signals', () => {
    it('returns excited for English excitement words', () => {
      expect(inferEmotion({ userMessage: 'this is amazing!' })).toBe('excited');
      expect(inferEmotion({ userMessage: 'wow, fantastic result' })).toBe('excited');
    });

    it('returns excited for Turkish excitement words', () => {
      expect(inferEmotion({ userMessage: 'bu harika!' })).toBe('excited');
      expect(inferEmotion({ userMessage: 'muhteşem, çok mükemmel' })).toBe('excited');
    });
  });

  describe('curiosity signals', () => {
    it('returns curious for question mark', () => {
      expect(inferEmotion({ userMessage: 'what is the capital of Turkey?' })).toBe('curious');
    });

    it('returns curious for curiosity keywords', () => {
      expect(inferEmotion({ userMessage: 'how does this work exactly' })).toBe('curious');
      expect(inferEmotion({ userMessage: 'explain me why this happens' })).toBe('curious');
    });
  });

  describe('surprise signals', () => {
    it('returns surprised for surprise triggers', () => {
      expect(inferEmotion({ userMessage: 'wow I never expected that' })).toBe('surprised');
      expect(inferEmotion({ userMessage: 'oh my! no way!' })).toBe('surprised');
    });
  });

  describe('task type overrides', () => {
    it('returns curious for research task type', () => {
      expect(inferEmotion({ userMessage: 'tell me more', taskType: 'research' })).toBe('curious');
    });

    it('returns empathetic for emotional task type', () => {
      expect(inferEmotion({ userMessage: 'tell me more', taskType: 'emotional' })).toBe('empathetic');
    });

    it('returns happy for greeting task type', () => {
      expect(inferEmotion({ userMessage: 'ok', taskType: 'greeting' })).toBe('happy');
    });
  });

  describe('response-based inference', () => {
    it('returns excited when assistant response contains celebratory signals', () => {
      const result = inferEmotion({
        userMessage: 'did I pass?',
        assistantResponse: 'Congratulations! You did it!',
      });
      expect(result).toBe('excited');
    });

    it('returns alert when assistant response contains alert signals', () => {
      const result = inferEmotion({
        userMessage: 'check my server',
        assistantResponse: 'Warning: critical error detected',
      });
      expect(result).toBe('alert');
    });
  });

  describe('fallback behaviour', () => {
    it('returns idle for neutral messages', () => {
      expect(inferEmotion({ userMessage: 'ok' })).toBe('idle');
      expect(inferEmotion({ userMessage: 'noted' })).toBe('idle');
    });

    it('returns idle when previous emotion is idle', () => {
      expect(inferEmotion({ userMessage: 'ok', previousEmotion: 'idle' })).toBe('idle');
    });
  });
});

describe('shouldTriggerSurprise', () => {
  it('returns true for surprise trigger words', () => {
    expect(shouldTriggerSurprise('wow no way!')).toBe(true);
    expect(shouldTriggerSurprise('oh my goodness')).toBe(true);
  });

  it('returns false for neutral text', () => {
    expect(shouldTriggerSurprise('please help me')).toBe(false);
    expect(shouldTriggerSurprise('what time is it?')).toBe(false);
  });
});
