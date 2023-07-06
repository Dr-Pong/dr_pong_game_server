import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { FactoryModule } from '../factory/factory.module';
import { GameController } from './game.controller';
import { QueueService } from '../queue/queue.service';
import { GameGateWay } from './game.gateway';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [FactoryModule, QueueModule],
  providers: [GameService, GameGateWay],
  exports: [GameService],
  controllers: [GameController],
})
export class GameModule {}
