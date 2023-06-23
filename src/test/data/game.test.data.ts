import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { InviteModel } from 'src/domain/factory/model/invite.model';
import { UserModel } from 'src/domain/factory/model/user.model';
import { UserFactory } from 'src/domain/factory/user.factory';
import { User } from 'src/domain/user/user.entity';
import { GAMEMODE_CLASSIC } from 'src/global/type/type.game.mode';
import { Repository } from 'typeorm';

@Injectable()
export class GameTestData {
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

  async createGameInvite(
    sender: UserModel,
    receiver: UserModel,
  ): Promise<void> {
    const newInvite: InviteModel = new InviteModel(
      sender.id,
      receiver.id,
      GAMEMODE_CLASSIC,
    );
    this.userFactory.invite(sender.id, receiver.id, newInvite);
  }
}
