import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service.js';

/**
 * Internal analytics endpoints.
 * GET /api/v1/analytics/sessions
 * GET /api/v1/analytics/usage
 * GET /api/v1/analytics/emotions
 */
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Get('sessions')
  getSessionStats(@Query('userId') userId?: string) {
    return this.analytics.getSessionStats(userId);
  }

  @Get('usage')
  getUsageStats(@Query('userId') userId?: string) {
    return this.analytics.getUsageStats(userId);
  }

  @Get('emotions')
  getEmotionStats(@Query('userId') userId?: string) {
    return this.analytics.getEmotionStats(userId);
  }
}
