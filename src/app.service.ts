import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { User } from './domain/user/user.entity';
import { UserRepository } from './domain/user/user.repository';
import { UserModel } from './domain/factory/model/user.model';
import { RedisUserRepository } from './domain/redis/redis.user.repository';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(
    private readonly redisUserRepository: RedisUserRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const users: User[] = await this.userRepository.findAll();

    for (const user of users) {
      this.redisUserRepository.create(UserModel.fromEntity(user));
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}
