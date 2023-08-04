import { Module } from '@nestjs/common';
import { RedisUserRepository } from './redis.user.repository';
import { RedisGameRepository } from './redis.game.repository';

@Module({
  providers: [RedisUserRepository, RedisGameRepository],
  exports: [RedisUserRepository, RedisGameRepository],
})
export class RedisRepositoryModule {}
