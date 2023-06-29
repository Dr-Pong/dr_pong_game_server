import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserModel } from 'src/domain/factory/model/user.model';
import { UserFactory } from 'src/domain/factory/user.factory';
import { User } from 'src/domain/user/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserTestData {
  constructor(
    private readonly userFactory: UserFactory,
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
  users: User[] = [];

  clear() {
    this.users.splice(0);
  }

  async createUser(nickname: string): Promise<UserModel> {
    const user: User = await this.userRepository.save({
      id: this.users.length + 1,
      nickname: nickname,
      ladderPoint: this.users.length + 101,
    });
    this.users.push(user);
    const userModel: UserModel = UserModel.fromEntity(user);
    this.userFactory.create(userModel);
    return userModel;
  }

  async createUserWithLp(nickname: string, lp: number): Promise<UserModel> {
    const user: User = await this.userRepository.save({
      id: this.users.length + 1,
      nickname: nickname,
      ladderPoint: lp,
    });
    this.users.push(user);
    const userModel: UserModel = UserModel.fromEntity(user);
    this.userFactory.create(userModel);
    return userModel;
  }

  async createBasicUsers(person: number): Promise<void> {
    const index: number = person;
    for (let i = 0; i < index; i++) {
      await this.createUser(`user${i}`);
    }
  }

  async giveTokenToUser(user: UserModel | User): Promise<string> {
    const token = this.jwtService.sign({
      id: user.id,
      nickname: user.nickname,
    });
    return token;
  }
}
