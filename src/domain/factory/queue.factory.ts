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
import { GameFactory } from './game.factory';

@Injectable()
export class QueueFactory {
  constructor(
    private readonly userFactory: UserFactory,
    private readonly gameFactory: GameFactory,
  ) {}
  ladderQueue: LadderQueue = new LadderQueue();
  private normalQueue: NormalQueue = new NormalQueue();
  static i = 0;

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
    while (this.normalQueue.size >= 2 && tmp?.data && tmp.next) {
      if (tmp.data.gameMode === tmp.next?.data.gameMode) {
        const user1: UserModel = this.userFactory.findById(tmp.data.userId);
        const user2: UserModel = this.userFactory.findById(
          tmp.next.data.userId,
        );
        const gameMode = tmp.data.gameMode;
        this.normalQueue.delete(tmp.next.data.userId);
        this.normalQueue.delete(tmp.data.userId);

        const game: GameModel = this.gameFactory.create(
          new GameModel(user1, user2, gameMode),
        );
        this.userFactory.setGameId(user1.id, game.id);
        this.userFactory.setGameId(user2.id, game.id);
        return game;
      }
      tmp = tmp.next;
    }
    return null;
  }

  ladderGameMatch(): GameModel {
    let tmp: List<LadderQueueUser> = this.ladderQueue.head;
    while (this.ladderQueue.size >= 2 && tmp?.data && tmp.next?.data) {
      if (isMatchableElo(tmp.data, tmp.next.data)) {
        const user1: UserModel = this.userFactory.findById(tmp.data.userId);
        const user2: UserModel = this.userFactory.findById(
          tmp.next.data.userId,
        );
        tmp = this.ladderQueue.head;
        this.ladderQueue.delete(user1.id);
        this.ladderQueue.delete(user2.id);

        const game: GameModel = this.gameFactory.create(
          new GameModel(user1, user2, GAMEMODE_CLASSIC),
        );
        this.userFactory.setGameId(user1.id, game.id);
        this.userFactory.setGameId(user2.id, game.id);
        return game;
      } else tmp = tmp.next;
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
  const user1Time = (Date.now() - user1.joinedTime.getTime()) / 1000;
  const user1MinMatchPoint: number =
    user1.ladderPoint - 10 * Math.log2(user1Time * 2);
  const user1MaxMatchPoint: number =
    user1.ladderPoint + 10 * Math.log2(user1Time * 2);

  const user2Time = (Date.now() - user2.joinedTime.getTime()) / 1000;
  const user2MinMatchPoint: number =
    user2.ladderPoint - 10 * Math.log2(user2Time * 2);
  const user2MaxMatchPoint: number =
    user2.ladderPoint + 10 * Math.log2(user2Time * 2);

  if (
    (user1MaxMatchPoint - user2MinMatchPoint) *
      (user2MaxMatchPoint - user1MinMatchPoint) >=
    0
  ) {
    // 테스트로 만들기 어려워서 일단 이걸로 대체해놨어요.. 나중에 리팩토링 하겠습니다.
    console.log(
      'match info:',
      ++QueueFactory.i,
      'user' + user1.userId.toString(),
      ':',
      user1.ladderPoint,
      'user' + user2.userId.toString(),
      ':',
      user2.ladderPoint,
    );
    return true;
  }
  return false;
}
