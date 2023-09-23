import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './domain/auth/auth.module';
import { FactoryModule } from './domain/factory/factory.module';
import { GameModule } from './domain/game/game.module';
import { ScheduleModule } from '@nestjs/schedule';
import { QueueModule } from './domain/queue/queue.module';
import { UserController } from './domain/user/user.controller';
import { UserModule } from './domain/user/user.module';
import { GatewayModule } from './domain/gateway/gateway.module';
import { RedisRepositoryModule } from './domain/redis/redis.repository.module';
import { RedisModule } from '@nestjs-modules/ioredis';
import { MutexModule } from './domain/mutex/mutex.module';

@Module({
  imports: [
    AuthModule,
    FactoryModule,
    GameModule,
    ScheduleModule.forRoot(),
    QueueModule,
    UserModule,
    GatewayModule,
    RedisRepositoryModule,
    RedisModule.forRootAsync({
      useFactory: () => ({
        config: {
          url: `${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
        },
      }),
    }),
    MutexModule,
  ],
  controllers: [AppController, UserController],
  providers: [AppService],
})
export class AppModule {}
