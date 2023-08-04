import { Module } from '@nestjs/common';
import { FactoryModule } from '../factory/factory.module';
import { GameController } from './game.controller';
import { GatewayModule } from '../gateway/gateway.module';
import { QueueModule } from '../queue/queue.module';
import { GameService } from './game.service';
import { RedisRepositoryModule } from '../redis/redis.repository.module';
import { MutexModule } from '../mutex/mutex.module';

@Module({
  imports: [
    FactoryModule,
    GatewayModule,
    QueueModule,
    RedisRepositoryModule,
    MutexModule,
  ],
  providers: [GameService],
  exports: [],
  controllers: [GameController],
})
export class GameModule {}
