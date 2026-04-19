import { Controller, Get, Param, Query } from '@nestjs/common';
import { MessagesService } from './messages.service.js';
import { PaginationQueryDto } from '../common/dto/pagination.dto.js';
import { CurrentUser, type AuthenticatedUser } from '../auth/current-user.decorator.js';
import type { ApiResponse, ChatMessage } from '@supperajan/types';

@Controller('sessions/:sessionId/messages')
export class MessagesController {
  constructor(private readonly service: MessagesService) {}

  @Get()
  async list(
    @Param('sessionId') sessionId: string,
    @Query() query: PaginationQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ApiResponse<ChatMessage[]>> {
    const { items, pagination } = await this.service.list(
      sessionId, user.id, query.page ?? 1, query.pageSize ?? 50,
    );
    return {
      success: true,
      data: items,
      meta: { requestId: '', timestamp: Date.now(), version: '1', pagination },
    };
  }
}
