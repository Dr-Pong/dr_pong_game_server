import { GameMode } from 'src/global/type/type.game.mode';
import { v4 as uuid } from 'uuid';
import { GameBoard } from '../objects/game-board';
import { Ball } from '../objects/ball';
import { GamePlayerModel } from './game-player.model';
import { UserModel } from './user.model';
import { GameLog } from './game.log';
import { GameType } from 'src/global/type/type.game.type';
import * as dotenv from 'dotenv';

dotenv.config();

export class GameModel {
  id: string;
  mode: GameMode;
  type: GameType;
  player1: GamePlayerModel;
  player2: GamePlayerModel;
  startTime: Date;
  endTime: Date;
  playTime: number;
  timer: number;
  board: GameBoard;
  ball: Ball;
  round: number;
  status: 'standby' | 'playing' | 'end';
  touchLog: GameLog[];
  pastBallPosition: { x: number; y: number }[];

  constructor(
    player1: UserModel,
    player2: UserModel,
    type: GameType,
    mode: GameMode,
  ) {
    this.id = uuid();
    this.type = type;
    this.mode = mode;
    this.playTime = 0;
    this.player1 = new GamePlayerModel(player1);
    this.player2 = new GamePlayerModel(player2);
    this.board = new GameBoard(
      +process.env.BOARD_WIDTH,
      +process.env.BOARD_HEIGHT,
    );
    this.ball = new Ball(+process.env.BALL_SIZE, +process.env.BALL_SPEED);
    this.startTime = new Date();
    this.round = 1;
    this.status = 'standby';
    this.touchLog = [];
    this.pastBallPosition = [];
  }
}
