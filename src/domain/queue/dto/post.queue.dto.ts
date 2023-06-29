import { GameMode } from 'src/global/type/type.game.mode';
import { GameType } from 'src/global/type/type.game.type';

export class PostQueueDto {
  userId: number;
  type: GameType;
  mode: GameMode;

  constructor(userId: number, type: GameType, mode: GameMode) {
    this.userId = userId;
    this.type = type;
    this.mode = mode;
  }
}
