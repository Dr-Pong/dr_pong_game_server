import { UserModel } from './user.model';

export class LadderQueueUser {
  userId: number;
  ladderPoint: number;
  joinedTime: Date;

  constructor(userModel: UserModel) {
    this.userId = userModel.id;
    this.ladderPoint = userModel.ladderPoint;
    this.joinedTime = new Date();
  }
}
