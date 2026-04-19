import { Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway.js';
import { SessionManagerService } from './session-manager.service.js';
import { ConversationService } from './conversation.service.js';
import { SessionsModule } from '../sessions/sessions.module.js';
import { MessagesModule } from '../messages/messages.module.js';
import { AiModule } from '../ai/ai.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [SessionsModule, MessagesModule, AiModule, AuthModule],
  providers: [RealtimeGateway, SessionManagerService, ConversationService],
  exports: [RealtimeGateway, SessionManagerService],
})
export class RealtimeModule {}
