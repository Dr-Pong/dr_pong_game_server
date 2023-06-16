import { BadRequestException, Injectable } from '@nestjs/common';
import { IsolationLevel, Transactional } from 'typeorm-transactional';
import { PostGameInviteDto } from './dto/post.game.invite.dto';
import { DeleteGameInviteDto } from './dto/delete.game.invite.dto';
import { PostGameInviteAcceptDto } from './dto/post.game.invite.accept.dto';
import { DeleteGameInviteRejectDto } from './dto/delete.game.invite.reject.dto';
import { UserFactory } from '../factory/user.factory';
import { InviteModel } from '../factory/model/invite.model';
import { USERSTATUS_IN_GAME } from 'src/global/type/type.user.status';
import { UserModel } from '../factory/model/user.model';

@Injectable()
export class GameService {
  constructor(private readonly userFactory: UserFactory) {}

  @Transactional({ isolationLevel: IsolationLevel.SERIALIZABLE })
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

  @Transactional({ isolationLevel: IsolationLevel.SERIALIZABLE })
  async deleteGameInvite(deleteDto: DeleteGameInviteDto): Promise<void> {
    const { sender, receiver } = deleteDto;
    const sendUser = this.userFactory.findById(sender);
    const receivedUser = this.userFactory.findById(receiver);
    if (receivedUser.invite.senderId === sender) {
      this.userFactory.uninvite(sendUser, receivedUser);
    }
  }

  @Transactional({ isolationLevel: IsolationLevel.SERIALIZABLE })
  async postGameInviteAccept(postDto: PostGameInviteAcceptDto): Promise<void> {}

  @Transactional({ isolationLevel: IsolationLevel.SERIALIZABLE })
  async deleteGameInviteReject(
    deleteDto: DeleteGameInviteRejectDto,
  ): Promise<void> {}
}
