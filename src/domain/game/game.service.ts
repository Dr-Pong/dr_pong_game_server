import { BadRequestException, Injectable } from '@nestjs/common';
import { GameFactory } from '../factory/game.factory';
import { GameModel } from '../factory/model/game.model';
import { UserModel } from '../factory/model/user.model';
import { PostGameDto } from './dto/post.game.dto';
import { PostGameResponseDto } from './dto/post.game.response.dto';
import { QueueGateWay } from '../gateway/queue.gateway';
import { Cron } from '@nestjs/schedule';
import { GameGateWay } from '../gateway/game.gateway';
import { patchUserStatesOutOfGame } from 'src/global/utils/socket.utils';
import { RedisUserRepository } from '../redis/redis.user.repository';
import { MutexManager } from '../mutex/mutex.manager';
import { QueueFactory } from '../factory/queue.factory';
import { Mutex } from 'async-mutex';

@Injectable()
export class GameService {
  constructor(
    private readonly redisUserRepository: RedisUserRepository,
    private readonly mutexManager: MutexManager,
    private readonly gameFactory: GameFactory,
    private readonly queueGateway: QueueGateWay,
    private readonly queueFactory: QueueFactory,
    private readonly gameGateway: GameGateWay,
  ) {}

  async postGame(postDto: PostGameDto): Promise<PostGameResponseDto> {
    const { type, mode } = postDto;
    const mutex: Mutex = this.mutexManager.getMutex('queue');
    let gameId: string;
    const release = await mutex.acquire();
    try {
      await this.checkUserInQueue(postDto.user1Id, release);
      await this.checkUserInQueue(postDto.user2Id, release);
      await this.checkUserIsInGame(postDto.user1Id, release);
      await this.checkUserIsInGame(postDto.user2Id, release);
      await this.redisUserRepository.setUserInfo(postDto.user1Id);
      await this.redisUserRepository.setUserInfo(postDto.user2Id);
      const user1: UserModel = await this.redisUserRepository.findById(
        postDto.user1Id,
      );
      const user2: UserModel = await this.redisUserRepository.findById(
        postDto.user2Id,
      );
      gameId = this.gameFactory.create(
        new GameModel(user1, user2, type, mode),
      ).id;
      await this.redisUserRepository.setGameId(user1.id, gameId);
      await this.redisUserRepository.setGameId(user2.id, gameId);
      this.queueGateway.sendJoinGame(user1.id);
      this.queueGateway.sendJoinGame(user2.id);
    } finally {
      release();
    }
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
        await this.gameGateway.exitGame(game);
        await this.redisUserRepository.deleteGameId(game.player1.id);
        await this.redisUserRepository.deleteGameId(game.player2.id);
        this.gameFactory.delete(game.id);
      }
    });
  }

  private async checkUserInQueue(
    userId: number,
    release: () => void,
  ): Promise<void> {
    if (this.queueFactory.isIn(userId)) {
      release();
      throw new BadRequestException('Already in queue');
    }
  }

  private async checkUserIsInGame(
    userId: number,
    release: () => void,
  ): Promise<void> {
    if ((await this.redisUserRepository.findById(userId))?.gameId) {
      release();
      throw new BadRequestException('Already in game');
    }
  }
}
