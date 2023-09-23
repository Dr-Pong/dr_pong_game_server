import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { RedisUserRepository } from './domain/redis/redis.user.repository';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(private readonly redisUserRepository: RedisUserRepository) {}

  async onApplicationBootstrap(): Promise<void> {
    //
  }

  getHello(): string {
    return 'Hello World!';
  }
}
