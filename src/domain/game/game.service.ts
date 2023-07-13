import { Injectable } from '@nestjs/common';
import { PostGameInviteDto } from './dto/post.game.invite.dto';
import { DeleteGameInviteDto } from './dto/delete.game.invite.dto';
import { PostGameInviteAcceptDto } from './dto/post.game.invite.accept.dto';
import { DeleteGameInviteRejectDto } from './dto/delete.game.invite.reject.dto';
import { UserFactory } from '../factory/user.factory';
import { InviteModel } from '../factory/model/invite.model';
import { GameModel } from '../factory/model/game.model';
import { UserModel } from '../factory/model/user.model';
import {
  checkAlreadyInGame,
  checkAlreadyInvited,
  validateInvite,
  validateUser,
} from './validation/errors.game';
import { GameInviteAcceptResponseDto } from './dto/game.invite.accept.response.dto';
import { GAMETYPE_NORMAL } from 'src/global/type/type.game.type';

@Injectable()
export class GameService {
  constructor(private readonly userFactory: UserFactory) {}

  async postGameInvite(postDto: PostGameInviteDto): Promise<void> {
    const { senderId, receiverId, mode } = postDto;
    const sendUser: UserModel = this.userFactory.findById(senderId);
    const receivedUser: UserModel = this.userFactory.findById(receiverId);
    validateUser(sendUser, receivedUser);
    checkAlreadyInvited(receivedUser, senderId);
    checkAlreadyInGame(receivedUser);
    const newInvite: InviteModel = new InviteModel(
      sendUser.id,
      receivedUser.id,
      mode,
    );
    this.userFactory.invite(sendUser.id, receivedUser.id, newInvite);
  }

  async deleteGameInvite(deleteDto: DeleteGameInviteDto): Promise<void> {
    const { senderId } = deleteDto;
    const sendUser = this.userFactory.findById(senderId);
    const receivedUser = this.userFactory.findById(sendUser.invite.receiverId);
    this.userFactory.deleteInvite(sendUser.id, receivedUser.id);
  }

  async postGameInviteAccept(
    postDto: PostGameInviteAcceptDto,
  ): Promise<GameInviteAcceptResponseDto> {
    const { userId, inviteId } = postDto;
    const acceptUser = this.userFactory.findById(userId);
    const invitation: InviteModel = acceptUser.inviteList.get(inviteId);
    const sendUser = this.userFactory.findById(invitation.senderId);
    validateInvite(invitation);
    this.deleteGameInvite({ senderId: invitation.senderId });
    const game: GameModel = new GameModel(
      sendUser,
      acceptUser,
      GAMETYPE_NORMAL,
      invitation.mode,
    );
    this.userFactory.setGameId(sendUser.id, game.id);
    this.userFactory.setGameId(acceptUser.id, game.id);
    return new GameInviteAcceptResponseDto(game.id);
  }

  async deleteGameInviteReject(
    deleteDto: DeleteGameInviteRejectDto,
  ): Promise<void> {
    const { userId, inviteId } = deleteDto;
    const receiver = this.userFactory.findById(userId);
    const invitation = receiver.inviteList.get(inviteId);
    validateInvite(invitation);

    const sender = this.userFactory.findById(invitation.senderId);

    this.userFactory.deleteInvite(sender.id, receiver.id);
  }
}
