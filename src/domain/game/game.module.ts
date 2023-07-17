import { Module } from '@nestjs/common';
import { FactoryModule } from '../factory/factory.module';
import { GameController } from './game.controller';
import { GatewayModule } from '../gateway/gateway.module';
import { QueueModule } from '../queue/queue.module';
import { GameService } from './game.service';

@Module({
  imports: [FactoryModule, GatewayModule, QueueModule],
  providers: [GameService],
  exports: [],
  controllers: [GameController],
})
export class GameModule {}
