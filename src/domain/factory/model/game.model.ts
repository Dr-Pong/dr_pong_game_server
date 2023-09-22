import {
  GAMEMODE_RANDOMBOUNCE,
  GameMode,
} from 'src/global/type/type.game.mode';
import { v4 as uuid } from 'uuid';
import { GameBoard } from '../objects/game-board';
import { Ball } from '../objects/ball';
import { GamePlayerModel } from './game-player.model';
import { UserModel } from './user.model';
import { GameLog } from './game.log';
import { GameType } from 'src/global/type/type.game.type';
import * as dotenv from 'dotenv';
import { randomInt } from 'crypto';

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
  randomSeed: number[];
  seedIndex: number;
  frame: number;

  constructor(
    player1: UserModel,
    player2: UserModel,
    type: GameType,
    mode: GameMode,
  ) {
    this.id = uuid();
    this.type = type;
    this.mode = mode;
    if (mode === GAMEMODE_RANDOMBOUNCE) {
      this.randomSeed = [];
      for (let i = 0; i < 300; i++) {
        this.randomSeed.push(randomInt(-5, 5));
      }
    }
    this.seedIndex = 0;
    this.playTime = 0;
    this.player1 = new GamePlayerModel(player1, false);
    this.player2 = new GamePlayerModel(player2, true);
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
    this.frame = 0;
  }
}
