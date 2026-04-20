import { Module } from '@nestjs/common';
import { EmotionService } from './emotion.service.js';

@Module({
  providers: [EmotionService],
  exports: [EmotionService],
})
export class EmotionModule {}
