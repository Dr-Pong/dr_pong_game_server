import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { FactoryModule } from '../factory/factory.module';
import { GameController } from './game.controller';
import { GatewayModule } from '../gateway/gateway.module';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [FactoryModule, GatewayModule, QueueModule],
  providers: [GameService],
  exports: [GameService],
  controllers: [GameController],
})
export class GameModule {}
