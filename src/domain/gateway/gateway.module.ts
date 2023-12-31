import { Module } from '@nestjs/common';
import { GameGateWay } from './game.gateway';
import { QueueGateWay } from './queue.gateway';
import { FactoryModule } from '../factory/factory.module';
import { RedisRepositoryModule } from '../redis/redis.repository.module';
import { MutexModule } from '../mutex/mutex.module';

@Module({
  imports: [RedisRepositoryModule, FactoryModule, MutexModule],
  providers: [GameGateWay, QueueGateWay],
  exports: [GameGateWay, QueueGateWay],
})
export class GatewayModule {}
