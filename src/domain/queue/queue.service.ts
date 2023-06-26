import { Injectable } from '@nestjs/common';
import { UserFactory } from '../factory/user.factory';
import { QueueFactory } from '../factory/queue.factory';
import { PostQueueDto } from './dto/post.queue.dto';
import { Mutex } from 'async-mutex';
import { GAMETYPE_LADDER, GameType } from 'src/global/type/type.game.type';
import { GAMEMODE_BULLET, GameMode } from 'src/global/type/type.game.mode';
import { GameModel } from '../factory/model/game.model';
import { DeleteQueueDto } from './dto/delete.queue.dto';
import { checkUserExist } from './validation/erros.queue';

@Injectable()
export class QueueService {
  constructor(
    private readonly userFactory: UserFactory,
    private readonly queueFactory: QueueFactory,
  ) {}
  private mutex: Mutex = new Mutex();
  private normalQueue: number[] = [];
  private bulletQueue: number[] = [];

  async postQueue(postDto: PostQueueDto): Promise<void> {
    const { userId, mode, type } = postDto;
    const user = this.userFactory.findById(userId);

    checkUserExist(user);
    const release = await this.mutex.acquire();

    try {
      this.matching(userId, type, mode);
    } finally {
      release();
    }
  }

  private matching(userId: number, type: GameType, mode: GameMode): void {
    if (type === GAMETYPE_LADDER) {
      this.queueFactory.addLadderQueue(userId);
      this.ladderMatchingAlgorhythem();
    }

    if (mode === GAMEMODE_BULLET) {
      this.bulletQueue.push(userId);
    } else {
      this.normalQueue.push(userId);
    }
    if (this.bulletQueue.length === 2 || this.normalQueue.length === 2) {
      const game: GameModel = new GameModel(mode);
    }
  }

  private async ladderMatchingAlgorhythem(): Promise<void> {
    //매칭 ladder 로직
  }

  async deleteQueue(deleteDto: DeleteQueueDto): Promise<void> {
    const { userId } = deleteDto;
    const user = this.userFactory.findById(userId);

    checkUserExist(user);

    const release = await this.mutex.acquire();

    try {
      this.deleteMatching(userId);
    } finally {
      release();
    }
  }

  private deleteMatching(userId: number): void {
    this.queueFactory.delete(userId);
    this.normalQueue = this.normalQueue.filter((id) => id !== userId);
    this.bulletQueue = this.bulletQueue.filter((id) => id !== userId);
  }
}
