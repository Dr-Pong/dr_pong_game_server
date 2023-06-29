import { GameMode } from 'src/global/type/type.game.mode';
import { UserModel } from './user.model';

export class NormalQueueUser {
  userId: number;
  gameMode: GameMode;

  constructor(userModel: UserModel, gameMode: GameMode) {
    this.userId = userModel.id;
    this.gameMode = gameMode;
  }
}
