import { BadRequestException, Injectable } from '@nestjs/common';
import { PostGameInviteDto } from './dto/post.game.invite.dto';
import { DeleteGameInviteDto } from './dto/delete.game.invite.dto';
import { PostGameInviteAcceptDto } from './dto/post.game.invite.accept.dto';
import { DeleteGameInviteRejectDto } from './dto/delete.game.invite.reject.dto';
import { UserFactory } from '../factory/user.factory';
import { InviteModel } from '../factory/model/invite.model';
import { USERSTATUS_IN_GAME } from 'src/global/type/type.user.status';
import { GameModel } from '../factory/model/game.model';
import { UserModel } from '../factory/model/user.model';

@Injectable()
export class GameService {
  constructor(private readonly userFactory: UserFactory) {}

  async postGameInvite(postDto: PostGameInviteDto): Promise<void> {
    this.validateGameInvite(postDto);

    const { senderId: sender, receiverId: receiver, mode } = postDto;
    const sendUser: UserModel = this.userFactory.findById(sender);
    const receivedUser: UserModel = this.userFactory.findById(receiver);

    const newInvite: InviteModel = new InviteModel(
      sendUser.id,
      receivedUser.id,
      mode,
    );
    this.userFactory.invite(sendUser.id, receivedUser.id, newInvite);
  }

  private validateGameInvite(postDto: PostGameInviteDto) {
    const { senderId: sender, receiverId: receiver } = postDto;

    const sendUser: UserModel = this.userFactory.findById(sender);
    const receivedUser: UserModel = this.userFactory.findById(receiver);

    if (receivedUser === sendUser) {
      throw new BadRequestException('invalid user');
    }

    const invite: InviteModel = Array.from(
      receivedUser.inviteList.values(),
    ).find((invite) => invite.senderId === sender);

    if (invite) {
      throw new BadRequestException('already invited');
    } else if (receivedUser.status === USERSTATUS_IN_GAME) {
      throw new BadRequestException('already in game');
    }
  }

  async deleteGameInvite(deleteDto: DeleteGameInviteDto): Promise<void> {
    const { senderId: sender } = deleteDto;
    const sendUser = this.userFactory.findById(sender);
    const receivedUser = this.userFactory.findById(sendUser.invite.receiverId);
    this.userFactory.deleteInvite(sendUser.id, receivedUser.id);
  }

  async postGameInviteAccept(postDto: PostGameInviteAcceptDto): Promise<void> {
    const { userId, inviteId } = postDto;
    const user = this.userFactory.findById(userId);
    const invitation = user.inviteList.get(inviteId);
    if (!invitation) {
      throw new BadRequestException('invalid invite');
    }

    this.deleteGameInvite({ senderId: invitation.senderId });
    const game: GameModel = new GameModel(invitation.mode);
  }

  async deleteGameInviteReject(
    deleteDto: DeleteGameInviteRejectDto,
  ): Promise<void> {
    const { userId, inviteId } = deleteDto;
    const receiver = this.userFactory.findById(userId);
    const invitation = receiver.inviteList.get(inviteId);
    if (!invitation) {
      throw new BadRequestException('invalid invite');
    }
    const sender = this.userFactory.findById(invitation.senderId);

    this.userFactory.deleteInvite(sender.id, receiver.id);
  }
}
