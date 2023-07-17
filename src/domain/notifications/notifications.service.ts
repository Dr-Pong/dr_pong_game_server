import { Injectable } from '@nestjs/common';
import { GetUserGameInvitesDto } from './dto/get.user-game.invites.dto';
import { InviteDto } from './dto/invite.dto';
import { UserModel } from '../factory/model/user.model';
import { UserFactory } from '../factory/user.factory';
import { checkUserExist } from '../queue/validation/erros.queue';

@Injectable()
export class NotificationsService {
  constructor(private readonly userFactory: UserFactory) {}

  async getUserGameInvites(
    getDto: GetUserGameInvitesDto,
  ): Promise<InviteDto[]> {
    const user: UserModel = this.userFactory.findById(getDto.userId);
    checkUserExist(user);
    const invites = [];
    user.inviteList.forEach((invite) => {
      const sender: UserModel = this.userFactory.findById(invite.senderId);
      invites.push(new InviteDto(invite.id, sender.nickname, invite.createdAt));
    });
    return invites;
  }
}
