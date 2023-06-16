import { BadRequestException, Injectable } from '@nestjs/common';
import { IsolationLevel, Transactional } from 'typeorm-transactional';
import { PostGameInviteDto } from './dto/post.game.invite.dto';
import { DeleteGameInviteDto } from './dto/delete.game.invite.dto';
import { PostGameInviteAcceptDto } from './dto/post.game.invite.accept.dto';
import { DeleteGameInviteRejectDto } from './dto/delete.game.invite.reject.dto';

@Injectable()
export class GameService {
  constructor(
    private readonly userFactory: UserFactory,
    private readonly queueFactory: QueueFactory,
  ) {}

  @Transactional({ isolationLevel: IsolationLevel.SERIALIZABLE })
  async postGameInvite(postDto: PostGameInviteDto): Promise<void> {
    const { sender, receiver, mode } = postDto;
    const senderId = await this.userFactory.getUserById(sender);
    const receiverId = await this.userFactory.getUserById(receiver);

    const invite: InviteModel = new InviteModel(senderId, receiverId);
  }

  @Transactional({ isolationLevel: IsolationLevel.SERIALIZABLE })
  async deleteGameInvite(deleteDto: DeleteGameInviteDto): Promise<void> {}

  @Transactional({ isolationLevel: IsolationLevel.SERIALIZABLE })
  async postGameInviteAccept(postDto: PostGameInviteAcceptDto): Promise<void> {}

  @Transactional({ isolationLevel: IsolationLevel.SERIALIZABLE })
  async deleteGameInviteReject(
    deleteDto: DeleteGameInviteRejectDto,
  ): Promise<void> {}
}
