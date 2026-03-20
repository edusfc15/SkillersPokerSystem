import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnalyticsService, type RankingFilter } from './analytics.service';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('ranking')
  @ApiOperation({ summary: 'Get player ranking with filter' })
  async getRanking(@Query('filter') filter: string = 'ALL_TIME') {
    const validFilters: RankingFilter[] = ['LAST_GAME', 'CURRENT_MONTH', 'CURRENT_YEAR', 'ALL_TIME'];
    const safeFilter: RankingFilter = validFilters.includes(filter as RankingFilter)
      ? (filter as RankingFilter)
      : 'ALL_TIME';
    return this.analyticsService.getRanking(safeFilter);
  }

  @Get('ranking/monthly')
  @ApiOperation({ summary: 'Get monthly ranking for a year' })
  async getMonthlyRanking(@Query('year') year: string) {
    const parsedYear = parseInt(year) || new Date().getFullYear();
    return this.analyticsService.getMonthlyRanking(parsedYear);
  }

  @Get('available-years')
  @ApiOperation({ summary: 'Get years that have finished games' })
  async getAvailableYears() {
    return this.analyticsService.getAvailableYears();
  }
}
