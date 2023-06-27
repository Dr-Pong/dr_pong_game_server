import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { FactoryModule } from '../factory/factory.module';
import { GameController } from './game.controller';
import { QueueService } from '../queue/queue.service';

@Module({
  imports: [FactoryModule],
  providers: [GameService, QueueService],
  exports: [GameService, QueueService],
  controllers: [GameController],
})
export class GameModule {}
