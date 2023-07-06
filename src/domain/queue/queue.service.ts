import { Injectable } from '@nestjs/common';
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

@Injectable()
export class QueueService {
  constructor(
    private readonly gameFactory: GameFactory,
    private readonly queueFactory: QueueFactory,
    private readonly queueGateway: QueueGateway,
  ) {}
  private mutex: Mutex = new Mutex();

  async postQueue(postDto: PostQueueDto): Promise<void> {
    const { userId, mode, type } = postDto;
    const release = await this.mutex.acquire();
    console.log(process.env.BOARD_WIDTH, process.env.BOARD_HEIGHT);

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
      console.log(this.gameFactory.create(newGame).id);
    }
  }

  private processLadderQueue(): void {
    while (true) {
      const newGame: GameModel = this.queueFactory.ladderGameMatch();
      if (!newGame) break;
      console.log(this.gameFactory.create(newGame).id);
      this.queueGateway.sendGameStart(newGame);
    }
  }
}
