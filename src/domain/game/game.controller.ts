import { Controller, Delete, Param, Post } from '@nestjs/common';
import { GameService } from './game.service';
import { Requestor } from '../auth/jwt/auth.requestor.decorator';
import { UserIdCardDto } from '../auth/jwt/auth.user.id-card.dto';
import { UserFactory } from '../factory/user.factory';
import { GameMode } from 'src/global/type/type.game.mode';
import { PostGameInviteDto } from './dto/post.game.invite.dto';
import { DeleteGameInviteDto } from './dto/delete.game.invite.dto';
import { PostGameInviteAcceptDto } from './dto/post.game.invite.accept.dto';
import { DeleteGameInviteRejectDto } from './dto/delete.game.invite.reject.dto';
import { QueueService } from '../queue/queue.service';
import { GameType } from 'src/global/type/type.game.type';
import { PostQueueDto } from '../queue/dto/post.queue.dto';
import { DeleteQueueDto } from '../queue/dto/delete.queue.dto';

@Controller('/games')
export class GameController {
  constructor(
    private readonly gameService: GameService,
    private readonly queueService: QueueService,
    private readonly userFactory: UserFactory,
  ) {}

  @Post('/invitation/:nickname/:mode')
  async gameInvitePost(
    @Requestor() requestor: UserIdCardDto,
    @Param('nickname') nickname: string,
    @Param('mode') mode: GameMode,
  ): Promise<void> {
    const { id: userId } = requestor;
    const { id: targetId } = this.userFactory.findByNickname(nickname);
    const postDto = new PostGameInviteDto(userId, targetId, mode);
    await this.gameService.postGameInvite(postDto);
  }

  @Delete('/invitation/:nickname')
  async gameInviteDelete(
    @Requestor() requestor: UserIdCardDto,
    @Param('nickname') nickname: string,
  ): Promise<void> {
    const { id: userId } = requestor;
    const { id: targetId } = this.userFactory.findByNickname(nickname);
    const deleteDto = new DeleteGameInviteDto(userId, targetId);
    await this.gameService.deleteGameInvite(deleteDto);
  }

  @Post('/invitation/:id')
  async gameInviteAccept(
    @Requestor() requestor: UserIdCardDto,
    @Param('id') id: string,
  ): Promise<void> {
    const { id: userId } = requestor;
    const postDto = new PostGameInviteAcceptDto(userId, id);
    await this.gameService.postGameInviteAccept(postDto);
  }

  @Delete('/invitation/:id')
  async gameInviteReject(
    @Requestor() requestor: UserIdCardDto,
    @Param('id') id: string,
  ): Promise<void> {
    const { id: userId } = requestor;
    const deleteDto = new DeleteGameInviteRejectDto(userId, id);
    await this.gameService.deleteGameInviteReject(deleteDto);
  }

  @Post('/queue/:type/:mode')
  async gameQueuePost(
    @Requestor() requestor: UserIdCardDto,
    @Param('type') type: GameType,
    @Param('mode') mode: GameMode,
  ): Promise<void> {
    const { id: userId } = requestor;
    const postDto = new PostQueueDto(userId, type, mode);
    await this.queueService.postQueue(postDto);
  }

  @Delete('/queue')
  async gameQueueDelete(@Requestor() requestor: UserIdCardDto): Promise<void> {
    const { id: userId } = requestor;
    const deleteDto = new DeleteQueueDto(userId);
    await this.queueService.deleteQueue(deleteDto);
  }
}
