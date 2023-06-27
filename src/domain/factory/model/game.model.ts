import { GameMode } from 'src/global/type/type.game.mode';
import { v4 as uuid } from 'uuid';

export class GameModel {
  id: string;
  mode: GameMode;
  player1: number;
  player2: number;
  createdAt: Date;

  constructor(player1: number, player2: number, mode: GameMode) {
    this.id = uuid();
    this.mode = mode;
    this.player1 = player1;
    this.player2 = player2;
    this.createdAt = new Date();
  }
}
