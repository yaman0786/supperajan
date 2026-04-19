import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { SessionsService } from './sessions.service.js';
import { CreateSessionDto } from './dto/create-session.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination.dto.js';
import { CurrentUser, type AuthenticatedUser } from '../auth/current-user.decorator.js';
import type { ApiResponse, ChatSession } from '@supperajan/types';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly service: SessionsService) {}

  @Post()
  async create(
    @Body() dto: CreateSessionDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ApiResponse<ChatSession>> {
    const data = await this.service.create(user.id, dto);
    return { success: true, data };
  }

  @Get()
  async list(
    @Query() query: PaginationQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ApiResponse<ChatSession[]>> {
    const { items, pagination } = await this.service.list(
      user.id, query.page ?? 1, query.pageSize ?? 20,
    );
    return {
      success: true, data: items,
      meta: { requestId: '', timestamp: Date.now(), version: '1', pagination },
    };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ApiResponse<ChatSession>> {
    const data = await this.service.findOne(id, user.id);
    return { success: true, data };
  }

  @Patch(':id/title')
  async updateTitle(
    @Param('id') id: string,
    @Body('title') title: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ApiResponse<ChatSession>> {
    const data = await this.service.updateTitle(id, user.id, title);
    return { success: true, data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async end(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.service.end(id, user.id);
  }
}
