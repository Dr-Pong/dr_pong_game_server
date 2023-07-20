import { Module } from '@nestjs/common';
import { GameGateWay } from './game.gateway';
import { QueueGateWay } from './queue.gateway';
import { FactoryModule } from '../factory/factory.module';

@Module({
  imports: [FactoryModule],
  providers: [GameGateWay, QueueGateWay],
  exports: [GameGateWay, QueueGateWay],
})
export class GatewayModule {}
