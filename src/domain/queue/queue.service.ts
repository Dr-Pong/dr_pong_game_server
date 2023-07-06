import { BadRequestException, Injectable } from '@nestjs/common';
import { UserFactory } from '../factory/user.factory';
import { QueueFactory } from '../factory/queue.factory';
import { PostQueueDto } from './dto/post.queue.dto';
import { Mutex } from 'async-mutex';
import { GAMETYPE_LADDER } from 'src/global/type/type.game.type';
import { GameModel } from '../factory/model/game.model';
import { DeleteQueueDto } from './dto/delete.queue.dto';
import { Cron } from '@nestjs/schedule';
import { GameFactory } from '../factory/game.factory';
import { QueueGateway } from './queue.gateway';
import { UserModel } from '../factory/model/user.model';

@Injectable()
export class QueueService {
  constructor(
    private readonly userFactory: UserFactory,
    private readonly gameFactory: GameFactory,
    private readonly queueFactory: QueueFactory,
    private readonly queueGateway: QueueGateway,
  ) {}
  private mutex: Mutex = new Mutex();

  async postQueue(postDto: PostQueueDto): Promise<void> {
    const { userId, mode, type } = postDto;
    const release = await this.mutex.acquire();
    if (this.queueFactory.isIn(userId)) {
      release();
      throw new BadRequestException('Already in queue');
    }
    const user: UserModel = this.userFactory.findById(userId);
    if (user.gameId) this.queueGateway.sendJoinGame(userId);

    try {
      if (type === GAMETYPE_LADDER) {
        this.queueFactory.addLadderQueue(userId);
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
}
