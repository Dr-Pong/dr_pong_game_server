import { Controller, Delete, Param, Post, UseGuards } from '@nestjs/common';
import { GameService } from './game.service';
import { Requestor } from '../auth/jwt/auth.requestor.decorator';
import { UserIdCardDto } from '../auth/jwt/auth.user.id-card.dto';
import { UserFactory } from '../factory/user.factory';
import { GameMode } from 'src/global/type/type.game.mode';
import { PostGameInviteDto } from './dto/post.game.invite.dto';
import { DeleteGameInviteDto } from './dto/delete.game.invite.dto';
import { PostGameInviteAcceptDto } from './dto/post.game.invite.accept.dto';
import { DeleteGameInviteRejectDto } from './dto/delete.game.invite.reject.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('/games')
export class GameController {
  constructor(
    private readonly gameService: GameService,
    private readonly userFactory: UserFactory,
  ) {}

  @Post('/invitation/:nickname/:mode')
  @UseGuards(AuthGuard('jwt'))
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

  @Delete('/invitation/nickname/:nickname')
  @UseGuards(AuthGuard('jwt'))
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
  @UseGuards(AuthGuard('jwt'))
  async gameInviteAccept(
    @Requestor() requestor: UserIdCardDto,
    @Param('id') id: string,
  ): Promise<void> {
    const { id: userId } = requestor;
    const postDto = new PostGameInviteAcceptDto(userId, id);
    await this.gameService.postGameInviteAccept(postDto);
  }

  @Delete('/invitation/id/:id')
  @UseGuards(AuthGuard('jwt'))
  async gameInviteReject(
    @Requestor() requestor: UserIdCardDto,
    @Param('id') id: string,
  ): Promise<void> {
    const { id: userId } = requestor;
    const deleteDto = new DeleteGameInviteRejectDto(userId, id);
    await this.gameService.deleteGameInviteReject(deleteDto);
  }
}
