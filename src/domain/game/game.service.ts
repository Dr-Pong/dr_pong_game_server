import { Injectable } from '@nestjs/common';
import { GameFactory } from '../factory/game.factory';
import { GameModel } from '../factory/model/game.model';
import { UserFactory } from '../factory/user.factory';
import { UserModel } from '../factory/model/user.model';
import { PostGameDto } from './dto/post.game.dto';
import { PostGameResponseDto } from './dto/post.game.response.dto';
import { QueueGateWay } from '../gateway/queue.gateway';
import { Cron } from '@nestjs/schedule';
import { GameGateWay } from '../gateway/game.gateway';
import { patchUserStatesOutOfGame } from 'src/global/utils/socket.utils';

@Injectable()
export class GameService {
  constructor(
    private readonly userFactory: UserFactory,
    private readonly gameFactory: GameFactory,
    private readonly queueGateway: QueueGateWay,
    private readonly gameGateway: GameGateWay,
  ) {}

  async postGame(postDto: PostGameDto): Promise<PostGameResponseDto> {
    const { type, mode } = postDto;
    await this.userFactory.setUserInfo(postDto.user1Id);
    await this.userFactory.setUserInfo(postDto.user2Id);
    const user1: UserModel = this.userFactory.findById(postDto.user1Id);
    const user2: UserModel = this.userFactory.findById(postDto.user2Id);
    const gameId: string = this.gameFactory.create(
      new GameModel(user1, user2, type, mode),
    ).id;
    this.userFactory.setGameId(user1.id, gameId);
    this.userFactory.setGameId(user2.id, gameId);
    this.queueGateway.sendJoinGame(user1.id);
    this.queueGateway.sendJoinGame(user2.id);
    return { gameId };
  }

  @Cron('0/10 * * * * *')
  async cleanUpUnmatchedGames(): Promise<void> {
    console.log('matching...');
    this.gameFactory.games.forEach(async (game) => {
      if (
        game.status === 'standby' &&
        new Date().getTime() - game.startTime.getTime() > 10000
      ) {
        await patchUserStatesOutOfGame(game);
        this.gameGateway.exitGame(game);
        this.userFactory.deleteGameId(game.player1.id);
        this.userFactory.deleteGameId(game.player2.id);
        this.gameFactory.delete(game.id);
      }
    });
  }
}
