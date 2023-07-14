import { Module } from '@nestjs/common';
import { GameGateWay } from './game.gateway';
import { QueueGateway } from './queue.gateway';
import { FactoryModule } from '../factory/factory.module';

@Module({
  imports: [FactoryModule],
  providers: [GameGateWay, QueueGateway],
  exports: [GameGateWay, QueueGateway],
})
export class GatewayModule {}
