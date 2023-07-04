import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { UserService } from './domain/user/user.service';
import { UserFactory } from './domain/factory/user.factory';
import { User } from './domain/user/user.entity';
import { UserRepository } from './domain/user/user.repository';
import { UserModel } from './domain/factory/model/user.model';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(
    private readonly userFactory: UserFactory,
    private readonly userRepository: UserRepository,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const users: User[] = await this.userRepository.findAll();

    for (const user of users) {
      this.userFactory.create(UserModel.fromEntity(user));
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}
