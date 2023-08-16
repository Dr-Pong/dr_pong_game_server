import { BadRequestException, Injectable } from '@nestjs/common';
import { QueueFactory } from '../factory/queue.factory';
import { PostQueueDto } from './dto/post.queue.dto';
import { Mutex } from 'async-mutex';
import { GAMETYPE_LADDER } from 'src/global/type/type.game.type';
import { GameModel } from '../factory/model/game.model';
import { DeleteQueueDto } from './dto/delete.queue.dto';
import { Cron } from '@nestjs/schedule';
import { GameFactory } from '../factory/game.factory';
import { QueueGateWay } from '../gateway/queue.gateway';
import { RedisUserRepository } from '../redis/redis.user.repository';
import { MutexManager } from '../mutex/mutex.manager';

@Injectable()
export class QueueService {
  constructor(
    private readonly redisUserRepository: RedisUserRepository,
    private readonly gameFactory: GameFactory,
    private readonly queueFactory: QueueFactory,
    private readonly queueGateway: QueueGateWay,
    private readonly mutexManager: MutexManager,
  ) {}

  async postQueue(postDto: PostQueueDto): Promise<void> {
    const { userId, mode, type } = postDto;
    const mutex: Mutex = this.mutexManager.getMutex('queue');
    const release = await mutex.acquire();
    await this.checkUserInQueue(userId, release);
    await this.checkUserIsInGame(userId, release);

    try {
      await this.redisUserRepository.setUserInfo(userId);
      if (type === GAMETYPE_LADDER) {
        await this.redisUserRepository.setLadderPoint(userId);
        await this.queueFactory.addLadderQueue(userId);
      } else {
        await this.queueFactory.addNormalQueue(userId, mode);
      }
    } finally {
      release();
    }
  }

  async deleteQueue(deleteDto: DeleteQueueDto): Promise<void> {
    const { userId } = deleteDto;
    const mutex: Mutex = this.mutexManager.getMutex('queue');
    const release = await mutex.acquire();

    try {
      this.queueFactory.delete(userId);
    } finally {
      release();
    }
  }

  @Cron('0/3 * * * * *')
  async matching(): Promise<void> {
    const mutex: Mutex = this.mutexManager.getMutex('queue');
    const release = await mutex.acquire();
    try {
      console.log('matching...');
      await this.processNormalQueue();
      await this.processLadderQueue();
    } finally {
      release();
    }
  }

  private async processNormalQueue(): Promise<void> {
    while (true) {
      const newGame: GameModel = await this.queueFactory.normalGameMatch();
      if (!newGame) break;
      this.gameFactory.create(newGame);
      await this.queueGateway.sendJoinGame(newGame.player1.id);
      await this.queueGateway.sendJoinGame(newGame.player2.id);
    }
  }

  private async processLadderQueue(): Promise<void> {
    while (true) {
      const newGame: GameModel = await this.queueFactory.ladderGameMatch();
      if (!newGame) break;
      this.gameFactory.create(newGame);
      await this.queueGateway.sendJoinGame(newGame.player1.id);
      await this.queueGateway.sendJoinGame(newGame.player2.id);
    }
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
