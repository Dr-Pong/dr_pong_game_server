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
import { UserFactory } from '../factory/user.factory';
import axios from 'axios';

@Injectable()
export class QueueService {
  constructor(
    private readonly userFactory: UserFactory,
    private readonly gameFactory: GameFactory,
    private readonly queueFactory: QueueFactory,
    private readonly queueGateway: QueueGateWay,
  ) {}
  private mutex: Mutex = new Mutex();

  async postQueue(postDto: PostQueueDto): Promise<void> {
    const { userId, mode, type } = postDto;
    const release = await this.mutex.acquire();
    this.checkUserInQueue(userId, release);
    this.checkUserIsInGame(userId, release);

    try {
      if (type === GAMETYPE_LADDER) {
        const userLp: number = await this.getUserLadderPointFromWebServer(
          userId,
        );
        this.queueFactory.addLadderQueue(userId, userLp);
      } else {
        this.queueFactory.addNormalQueue(userId, mode);
      }
    } finally {
      release();
    }
  }

  async deleteQueue(deleteDto: DeleteQueueDto): Promise<void> {
    const { userId } = deleteDto;

    const release = await this.mutex.acquire();

    try {
      this.queueFactory.delete(userId);
    } finally {
      release();
    }
  }

  @Cron('0/3 * * * * *')
  async matching(): Promise<void> {
    const release = await this.mutex.acquire();
    try {
      console.log('matching...');
      this.processNormalQueue();
      this.processLadderQueue();
    } finally {
      release();
    }
  }

  private processNormalQueue(): void {
    while (true) {
      const newGame: GameModel = this.queueFactory.normalGameMatch();
      if (!newGame) break;
      this.gameFactory.create(newGame);
      this.queueGateway.sendJoinGame(newGame.player1.id);
      this.queueGateway.sendJoinGame(newGame.player2.id);
    }
  }

  private processLadderQueue(): void {
    while (true) {
      const newGame: GameModel = this.queueFactory.ladderGameMatch();
      if (!newGame) break;
      this.gameFactory.create(newGame);
      this.queueGateway.sendJoinGame(newGame.player1.id);
      this.queueGateway.sendJoinGame(newGame.player2.id);
    }
  }

  private checkUserInQueue(userId: number, release: () => void): void {
    if (this.queueFactory.isIn(userId)) {
      release();
      throw new BadRequestException('Already in queue');
    }
  }

  private checkUserIsInGame(userId: number, release: () => void): void {
    if (this.userFactory.findById(userId)?.gameId) {
      release();
      throw new BadRequestException('Already in game');
    }
  }

  private async getUserLadderPointFromWebServer(
    userId: number,
  ): Promise<number> {
    try {
      const response = await axios.get(
        process.env.WEBSERVER_URL + '/users/' + userId + '/ranks/current',
      );
      this.userFactory.setLadderPoint(userId, response.data.lp);
      return response.data.lp;
    } catch (error) {
      throw new BadRequestException('Error getting rank');
    }
  }
}
