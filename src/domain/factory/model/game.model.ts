import { GameMode } from 'src/global/type/type.game.mode';
import { v4 as uuid } from 'uuid';

export class GameModel {
  id: string;
  mode: GameMode;
  createdAt: Date;

  constructor(mode: GameMode) {
    this.id = uuid();
    this.mode = mode;
    this.createdAt = new Date();
  }
}
