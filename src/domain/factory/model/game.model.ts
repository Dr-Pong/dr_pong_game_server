import { GameMode } from 'src/global/type/type.game.mode';
import { v4 as uuid } from 'uuid';
import { GameBoard } from '../objects/board';
import { Ball } from '../objects/ball';
import { GamePlayerModel } from './game-player.model';
import { UserModel } from './user.model';
import { GameLog } from './game.log';

export class GameModel {
  id: string;
  mode: GameMode;
  player1: GamePlayerModel;
  player2: GamePlayerModel;
  startTime: Date;
  board: GameBoard;
  ball: Ball;
  round: number;
  status: 'stanby' | 'playing' | 'end';
  log: GameLog[];

  constructor(player1: UserModel, player2: UserModel, mode: GameMode) {
    this.id = uuid();
    this.mode = mode;
    this.player1 = new GamePlayerModel(player1.id, player1.nickname);
    this.player2 = new GamePlayerModel(player2.id, player2.nickname);
    this.board = new GameBoard(800, 600);
    this.ball = new Ball(1, 2);
    this.startTime = new Date();
    this.round = 1;
    this.status = 'stanby';
    this.log = [];
  }

  start(): void {
    this.status = 'playing';
    
  }
}
