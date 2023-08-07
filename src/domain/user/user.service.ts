import { Injectable } from '@nestjs/common';
import { UserFactory } from '../factory/user.factory';
import {
  IsolationLevel,
  Transactional,
  runOnTransactionComplete,
} from 'typeorm-transactional';
import { User } from './user.entity';
import { UserModel } from '../factory/model/user.model';
import { PostGatewayUserDto } from './dto/post.gateway.users.dto';
import { UserRepository } from './user.repository';
import { RedisUserRepository } from '../redis/redis.user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly redisUserRepository: RedisUserRepository,
    private readonly userRepository: UserRepository,
  ) {}

  @Transactional({ isolationLevel: IsolationLevel.SERIALIZABLE })
  async postUser(postDto: PostGatewayUserDto): Promise<void> {
    const user: User = await this.userRepository.save(postDto);

    runOnTransactionComplete(async () => {
      this.redisUserRepository.create(UserModel.fromEntity(user));
    });
  }
}
