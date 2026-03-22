import { Module } from '@nestjs/common';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { PrismaService } from '../prisma.service';
import { AdminGuard } from '../auth/guards/admin.guard';

@Module({
  controllers: [GamesController],
  providers: [GamesService, PrismaService, AdminGuard],
  exports: [GamesService],
})
export class GamesModule {}
