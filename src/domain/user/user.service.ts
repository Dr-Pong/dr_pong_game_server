import { Injectable } from '@nestjs/common';
import { UserModel } from '../factory/model/user.model';
import { PostGatewayUserDto } from './dto/post.gateway.users.dto';
import { RedisUserRepository } from '../redis/redis.user.repository';

@Injectable()
export class UserService {
  constructor(private readonly redisUserRepository: RedisUserRepository) {}

  async postUser(postDto: PostGatewayUserDto): Promise<void> {
    await this.redisUserRepository.create(
      new UserModel(postDto.id, postDto.nickname),
    );
  }
}
