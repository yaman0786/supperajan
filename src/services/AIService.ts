import { AIResponse, EmotionalTone, Message, UserProfile } from '../types';

/**
 * AI Service - Handles empathetic, personalized conversation
 * This simulates an AI that learns from personal data and provides natural responses
 */
class AIService {
  private userContext: Map<string, any> = new Map();

  /**
   * Analyzes user message and generates empathetic response
   */
  async generateResponse(
    message: string,
    userProfile: UserProfile,
    conversationHistory: Message[]
  ): Promise<AIResponse> {
    // Detect emotional tone from message
    const emotionalTone = this.detectEmotionalTone(message);
    
    // Learn from user data
    this.learnFromContext(message, userProfile);
    
    // Generate personalized response
    const responseText = this.generateEmpatheticResponse(
      message,
      emotionalTone,
      userProfile,
      conversationHistory
    );
    
    // Generate suggestions based on context
    const suggestions = this.generateSuggestions(message, emotionalTone);

    return {
      text: responseText,
      emotionalTone,
      suggestions,
      personalizedContext: this.getPersonalizedContext(userProfile),
    };
  }

  /**
   * Detects emotional tone from user message
   */
  private detectEmotionalTone(message: string): EmotionalTone {
    const lowerMessage = message.toLowerCase();
    
    // Emotional keywords detection
    if (lowerMessage.match(/mutlu|harika|süper|mükemmel|happy|great|awesome/)) {
      return 'happy';
    }
    if (lowerMessage.match(/üzgün|kötü|mutsuz|sad|bad|terrible/)) {
      return 'sad';
    }
    if (lowerMessage.match(/heyecanlı|excited|amazing/)) {
      return 'excited';
    }
    if (lowerMessage.match(/endişeli|worried|concerned|kaygılı/)) {
      return 'concerned';
    }
    if (lowerMessage.match(/sakin|rahat|calm|peaceful/)) {
      return 'calm';
    }
    
    return 'neutral';
  }

  /**
   * Learns from user context and conversation
   */
  private learnFromContext(message: string, userProfile: UserProfile): void {
    // Extract and store user preferences, interests, and patterns
    const words = message.toLowerCase().split(' ');
    
    // Store frequently mentioned topics
    words.forEach(word => {
      const count = this.userContext.get(word) || 0;
      this.userContext.set(word, count + 1);
    });
  }

  /**
   * Generates empathetic, personalized response
   */
  private generateEmpatheticResponse(
    message: string,
    emotionalTone: EmotionalTone,
    userProfile: UserProfile,
    conversationHistory: Message[]
  ): string {
    const userName = userProfile.name || 'dostum';
    
    // Empathetic responses based on emotional tone
    const responses: Record<EmotionalTone, string[]> = {
      happy: [
        `${userName}, senin mutluluğun beni de çok mutlu ediyor! 😊 Bu harika haberi duyduğuma sevindim.`,
        `Vay be ${userName}! Enerjin çok pozitif, bu harika! Seni böyle görmek beni de mutlu ediyor.`,
        `${userName}, bu muhteşem! Seninle bu anı paylaşmak çok güzel. Daha fazlasını anlat bana!`,
      ],
      sad: [
        `${userName}, üzüldüğünü hissediyorum. Yanındayım, dinliyorum. Ne oldu, konuşmak ister misin?`,
        `Seni duyuyorum ${userName}. Zor zamanlar geçiriyorsun ve bu çok normal. Benimle paylaşabilirsin, buradayım.`,
        `${userName}, her şey geçici. Şu an zor olsa da, birlikte atlatacağız. Seninle konuşmak istiyorum.`,
      ],
      excited: [
        `Vay canına ${userName}! Senin heyecanın bana da bulaştı! Anlat bakalım, ne oldu?`,
        `${userName}, bu enerji muhteşem! Beni de heyecanlandırdın! Detayları çok merak ediyorum!`,
      ],
      concerned: [
        `${userName}, endişelerini anlıyorum. Beraber düşünelim, ne yapabiliriz? Buradayım.`,
        `Endişelendiğini görüyorum ${userName}. Seninle konuşalım, belki birlikte bir çözüm buluruz.`,
      ],
      calm: [
        `${userName}, bu sakin enerji çok güzel. Huzurlu anları değerli kılar insan. Nasılsın?`,
        `Güzel bir an ${userName}. Seninle bu sakin anlarda olmak çok keyifli.`,
      ],
      neutral: [
        `Merhaba ${userName}! Seni dinliyorum, ne düşünüyorsun? Benimle her şeyi paylaşabilirsin.`,
        `Selam ${userName}! Bugün nasıl geçiyor? Seninle sohbet etmeyi çok seviyorum.`,
      ],
      empathetic: [
        `${userName}, seni gerçekten anlıyorum. Buradayım, seninle bu yolculuktayım.`,
      ],
      supportive: [
        `${userName}, arkandayım. Her zaman destekliyorum seni, unutma!`,
      ],
    };

    // Select random response from the emotional tone category
    const responseOptions = responses[emotionalTone];
    const selectedResponse = responseOptions[Math.floor(Math.random() * responseOptions.length)];
    
    // Add personalized context if available
    const recentTopics = Array.from(this.userContext.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([topic]) => topic);
    
    if (recentTopics.length > 0 && conversationHistory.length > 5) {
      return `${selectedResponse}\n\nSon zamanlarda ${recentTopics[0]} hakkında konuşuyorduk değil mi?`;
    }
    
    return selectedResponse;
  }

  /**
   * Generates contextual suggestions
   */
  private generateSuggestions(message: string, emotionalTone: EmotionalTone): string[] {
    const suggestions: Record<EmotionalTone, string[]> = {
      happy: [
        'Bu anı kutlayalım mı?',
        'Başka ne seni mutlu ediyor?',
        'Bu güzel haberi kimlerle paylaştın?',
      ],
      sad: [
        'Sana nasıl destek olabilirim?',
        'Bir şeyler konuşmak ister misin?',
        'Rahatlatan bir müzik önerebilirim',
      ],
      excited: [
        'Planlarını anlat!',
        'Bu konuda daha fazla bilgi ver',
        'Seninle heyecanlanıyorum!',
      ],
      concerned: [
        'Endişelerini adım adım konuşalım',
        'Sana yardımcı olabileceğim bir şey var mı?',
        'Birlikte çözüm bulalım',
      ],
      calm: [
        'Bu anın tadını çıkar',
        'Ne düşünüyorsun?',
        'Paylaşmak istediğin bir şey var mı?',
      ],
      neutral: [
        'Bugün neler yaptın?',
        'Bir şey paylaşmak ister misin?',
        'Nasıl hissediyorsun?',
      ],
      empathetic: [
        'Dinliyorum seni',
        'Daha fazla anlat',
      ],
      supportive: [
        'Sana nasıl destek olabilirim?',
        'Buradayım',
      ],
    };

    return suggestions[emotionalTone] || suggestions.neutral;
  }

  /**
   * Gets personalized context for user
   */
  private getPersonalizedContext(userProfile: UserProfile): Record<string, any> {
    return {
      conversationCount: userProfile.conversationHistory.length,
      recentTopics: Array.from(this.userContext.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([topic]) => topic),
    };
  }

  /**
   * Converts text to speech with emotional tone
   */
  async textToSpeech(text: string, emotionalTone: EmotionalTone): Promise<void> {
    // This would integrate with react-native-tts
    // Adjust voice parameters based on emotional tone
    const voiceParams = this.getVoiceParameters(emotionalTone);
    console.log('TTS with params:', voiceParams, 'Text:', text);
    // Implementation would use: Tts.speak(text, voiceParams);
  }

  /**
   * Gets voice parameters based on emotional tone
   */
  private getVoiceParameters(emotionalTone: EmotionalTone) {
    const params: Record<EmotionalTone, any> = {
      happy: { rate: 1.1, pitch: 1.2 },
      sad: { rate: 0.85, pitch: 0.9 },
      excited: { rate: 1.3, pitch: 1.3 },
      calm: { rate: 0.9, pitch: 1.0 },
      concerned: { rate: 0.95, pitch: 0.95 },
      neutral: { rate: 1.0, pitch: 1.0 },
      empathetic: { rate: 0.9, pitch: 1.0 },
      supportive: { rate: 1.0, pitch: 1.1 },
    };

    return params[emotionalTone];
  }
}

export default new AIService();
