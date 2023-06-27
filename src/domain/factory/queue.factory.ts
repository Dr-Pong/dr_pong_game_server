import { Injectable } from '@nestjs/common';
import { UserFactory } from './user.factory';
import { UserModel } from './model/user.model';
import { GAMEMODE_CLASSIC, GameMode } from 'src/global/type/type.game.mode';
import { List } from 'src/global/utils/list';
import { GameModel } from './model/game.model';
import { LadderQueueUser } from './model/ladder-queue.user';
import { NormalQueueUser } from './model/normal-queue.user';
import { LadderQueue } from '../queue/utils/ladder.queue';
import { NormalQueue } from '../queue/utils/normal.queue';

@Injectable()
export class QueueFactory {
  constructor(private readonly userFactory: UserFactory) {}
  private ladderQueue: LadderQueue = new LadderQueue();
  private normalQueue: NormalQueue = new NormalQueue();

  addLadderQueue(userId: number): void {
    const user: UserModel = this.userFactory.findById(userId);
    this.ladderQueue.add(new LadderQueueUser(user));
  }

  addNormalQueue(userId: number, mode: GameMode): void {
    const user: UserModel = this.userFactory.findById(userId);
    this.normalQueue.add(new NormalQueueUser(user, mode));
  }

  normalGameMatch(): GameModel {
    let tmp: List<NormalQueueUser> = this.normalQueue.head;
    while (tmp.data && tmp.next) {
      if (tmp.data.gameMode === tmp.next?.data.gameMode) {
        const user1Id = tmp.data.userId;
        const user2Id = tmp.next.data.userId;
        const gameMode = tmp.data.gameMode;
        this.normalQueue.delete(tmp.next.data.userId);
        this.normalQueue.delete(tmp.data.userId);

        return this.gameFactory.create(
          new GameModel(user1Id, user2Id, gameMode),
        );
      }
      tmp = tmp.next;
    }
    return null;
  }

  ladderGameMatch(): GameModel {
    let tmp: List<LadderQueueUser> = this.ladderQueue.head;
    while (tmp.data && tmp.next) {
      if (isMatchableElo(tmp.data, tmp.next.data)) {
        this.ladderQueue.delete(tmp.data.userId);
        this.ladderQueue.delete(tmp.next.data.userId);
        return this.gameFactory.create(
          new GameModel(
            tmp.data.userId,
            tmp.next.data.userId,
            GAMEMODE_CLASSIC,
          ),
        );
      }
      tmp = tmp.next;
    }
    return null;
  }

  delete(userId: number): void {
    this.ladderQueue.delete(userId);
    this.normalQueue.delete(userId);
  }
}

function isMatchableElo(
  user1: LadderQueueUser,
  user2: LadderQueueUser,
): boolean {
  const user1Time = (user1.joinedTime.getTime() - Date.now()) / 1000;
  const user1MinMatchPoint: number =
    user1.ladderPoint - 16 * Math.log2(user1Time);
  const user1MaxMatchPoint: number =
    user1.ladderPoint + 16 * Math.log2(user1Time);

  const user2Time = (user2.joinedTime.getTime() - Date.now()) / 1000;
  const user2MinMatchPoint: number =
    user2.ladderPoint - 16 * Math.log2(user2Time);
  const user2MaxMatchPoint: number =
    user2.ladderPoint + 16 * Math.log2(user2Time);

  if (
    user1MaxMatchPoint > user2MinMatchPoint ||
    user1MinMatchPoint < user2MaxMatchPoint
  ) {
    return true;
  }
  return false;
}
