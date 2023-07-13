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

@Injectable()
export class UserService {
  constructor(
    private readonly userFactory: UserFactory,
    private readonly userRepository: UserRepository,
  ) {}

  @Transactional({ isolationLevel: IsolationLevel.SERIALIZABLE })
  async postUser(postDto: PostGatewayUserDto): Promise<void> {
    const user: User = await this.userRepository.save(postDto);

    runOnTransactionComplete(async () => {
      this.userFactory.create(UserModel.fromEntity(user));
    });
  }
}
