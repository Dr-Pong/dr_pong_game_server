import { BadRequestException, Injectable } from '@nestjs/common';
import { IsolationLevel, Transactional } from 'typeorm-transactional';
import { PostGameInviteDto } from './dto/post.game.invite.dto';
import { DeleteGameInviteDto } from './dto/delete.game.invite.dto';
import { PostGameInviteAcceptDto } from './dto/post.game.invite.accept.dto';
import { DeleteGameInviteRejectDto } from './dto/delete.game.invite.reject.dto';
import { UserFactory } from '../factory/user.factory';
import { InviteModel } from '../factory/model/invite.model';
import { USERSTATUS_IN_GAME } from 'src/global/type/type.user.status';
import { GameModel } from '../factory/model/game.model';

@Injectable()
export class GameService {
  constructor(private readonly userFactory: UserFactory) {}

  async postGameInvite(postDto: PostGameInviteDto): Promise<void> {
    const { sender, receiver, mode } = postDto;

    const sendUser = this.userFactory.findById(sender);
    const receivedUser = this.userFactory.findById(receiver);
    if (receivedUser.invite.senderId === sender) {
      throw new BadRequestException('already invited');
    } else if (receivedUser.status === USERSTATUS_IN_GAME) {
      throw new BadRequestException('already in game');
    }

    const invite: InviteModel = new InviteModel(
      sendUser.id,
      receivedUser.id,
      mode,
    );

    this.userFactory.invite(receivedUser.id, invite);
  }

  async deleteGameInvite(deleteDto: DeleteGameInviteDto): Promise<void> {
    const { sender, receiver } = deleteDto;
    const sendUser = this.userFactory.findById(sender);
    const receivedUser = this.userFactory.findById(receiver);
    if (receivedUser.invite.senderId === sender) {
      this.userFactory.uninvite(sendUser, receivedUser);
    }
  }

  async postGameInviteAccept(postDto: PostGameInviteAcceptDto): Promise<void> {
    const { userId, inviteId } = postDto;
    const user = this.userFactory.findById(userId);
    const invitation = Array.from(user.inviteList.values()).find((invite) => {
      return invite.id === inviteId;
    });
    if (!invitation) {
      throw new BadRequestException('invalid invite');
    }

    const game: GameModel = new GameModel(invitation.id, invitation.mode);
  }

  async deleteGameInviteReject(
    deleteDto: DeleteGameInviteRejectDto,
  ): Promise<void> {
    const { userId, inviteId } = deleteDto;
    const user = this.userFactory.findById(userId);
    const invitation = Array.from(user.inviteList.values()).find((invite) => {
      return invite.id === inviteId;
    });
    if (!invitation) {
      throw new BadRequestException('invalid invite');
    }

    this.userFactory.uninvite(user, user);
  }
}
