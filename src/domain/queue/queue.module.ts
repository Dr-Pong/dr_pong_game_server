import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { FactoryModule } from '../factory/factory.module';
import { GatewayModule } from '../gateway/gateway.module';
import { MutexModule } from '../mutex/mutex.module';
import { RedisRepositoryModule } from '../redis/redis.repository.module';

@Module({
  imports: [FactoryModule, GatewayModule, MutexModule, RedisRepositoryModule],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
