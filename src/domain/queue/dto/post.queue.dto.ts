import { GameMode } from 'src/global/type/type.game.mode';
import { GameType } from 'src/global/type/type.game.type';

export class PostQueueDto {
  userId: number;
  mode: GameMode;
  type: GameType;

  constructor(userId: number, mode: GameMode, type: GameType) {
    this.userId = userId;
    this.mode = mode;
    this.type = type;
  }
}
