import { UserModel } from './user.model';

export class LadderQueueUser {
  userId: number;
  ladderPoint: number;
  joinedTime: Date;

  constructor(userId: number, ladderPoint: number) {
    this.userId = userId;
    this.ladderPoint = ladderPoint;
    this.joinedTime = new Date();
  }
}
