import { GameMode } from 'src/global/type/type.game.mode';
import { v4 as uuid } from 'uuid';
import { GameBoard } from '../objects/game-board';
import { Ball } from '../objects/ball';
import { GamePlayerModel } from './game-player.model';
import { UserModel } from './user.model';
import { GameLog } from './game.log';
import { Bar } from '../objects/bar';
import * as util from 'util';

export class GameModel {
  id: string;
  mode: GameMode;
  player1: GamePlayerModel;
  player2: GamePlayerModel;
  startTime: Date;
  endTime: Date;
  board: GameBoard;
  ball: Ball;
  round: number;
  status: 'standby' | 'playing' | 'end';
  touchLog: GameLog[];
  pastBallPosition: { x: number; y: number }[];

  constructor(player1: UserModel, player2: UserModel, mode: GameMode) {
    this.id = uuid();
    this.mode = mode;
    this.player1 = new GamePlayerModel(player1.id, player1.nickname);
    this.player2 = new GamePlayerModel(player2.id, player2.nickname);
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

  start(): GameModel {
    console.log(
      '-----------game start-----------\n-----------------------------\n',
    );
    setTimeout(() => {
      if (this.status !== 'end') {
        this.status = 'playing';
        this.gameLoop();
      }
    }, 3000);
    return this;
  }

  end(): void {
    this.status = 'end';
    this.endTime = new Date();
    console.log('result: ', util.inspect(this, true, 10, true));
  }

  reset(): void {
    this.status = 'standby';
    this.ball.reset(this.round % 2 === 0 ? 1 : -1);
    this.player1.bar.reset();
    this.player2.bar.reset();
    this.pastBallPosition = [];
    setTimeout(() => {
      this.status = 'playing';
      this.gameLoop();
    }, 2000);
  }

  async gameLoop(): Promise<void> {
    if (this.status !== 'playing') {
      return;
    }
    this.pastBallPosition.push({ x: this.ball.x, y: this.ball.y });
    if (this.pastBallPosition.length > +process.env.GAME_FRAME) {
      this.pastBallPosition.shift();
    }
    this.move();
    this.handleTouchEvent();
    this.handleGoal();
    this.drow(); // 콘솔에 그려주는 함수. 디버깅용
    setTimeout(() => {
      this.gameLoop();
    }, 1000 / +process.env.GAME_FRAME);
  }

  move(): void {
    this.ball.move();
    this.player1.bar.move();
    this.player2.bar.move();
  }

  handleTouchEvent(): void {
    this.handleTouchBar(this.player1);
    this.handleTouchBar(this.player2);
    this.handleTouchWall();
  }

  handleTouchBar(player: GamePlayerModel): void {
    const bar: Bar = player.bar;
    const ball: Ball = this.ball;

    // user2 바 체크
    if (
      player.id === this.player2.id &&
      this.isBallTouchingBar(ball, bar, this.board.height)
    ) {
      this.handleBallTouchingBar(ball, player, this.board.height - ball.size);
    }

    //  user1 바 체크
    if (player.id === this.player1.id && this.isBallTouchingBar(ball, bar, 0)) {
      this.handleBallTouchingBar(ball, player, ball.size);
    }
  }

  handleTouchWall(): void {
    const ball: Ball = this.ball;

    // 왼쪽 벽 체크
    if (ball.x - ball.size <= 0) {
      ball.touchWall();
      ball.setPosition(ball.size, ball.y);
    }
    // 오른쪽 벽 체크
    if (ball.x + ball.size >= this.board.width) {
      ball.touchWall();
      ball.setPosition(this.board.width - ball.size, ball.y);
    }
  }

  handleGoal(): void {
    const ball: Ball = this.ball;
    const player1Win: boolean = ball.y + ball.size > this.board.height;
    const player2Win: boolean = ball.y - ball.size < 0;

    if (player1Win) {
      this.player1.score++;
      this.touchLog.push(
        new GameLog(this.player1.id, this.round, 'score', ball),
      );
      this.round++;
      console.log('player1 win');
    }

    if (player2Win) {
      this.player2.score++;
      this.touchLog.push(
        new GameLog(this.player2.id, this.round, 'score', ball),
      );
      this.round++;
      console.log('player2 win');
    }
    if (this.checkGameEnd()) return this.end();
    if (player1Win || player2Win) {
      this.reset();
    }
  }

  checkGameEnd(): boolean {
    return (
      this.player1.score === +process.env.GAME_FINISH_SCORE ||
      this.player2.score === +process.env.GAME_FINISH_SCORE ||
      this.startTime.getTime() + +process.env.GAME_TIME < Date.now()
    );
  }

  private isBallTouchingBar(ball: Ball, bar: Bar, yPosition: number): boolean {
    const barLeft: number = bar.position - bar.width / 2;
    const barRight: number = bar.position + bar.width / 2;

    if (yPosition === 0)
      return (
        ball.y - ball.size <= yPosition &&
        ball.x >= barLeft &&
        ball.x <= barRight
      );
    return (
      ball.y + ball.size >= yPosition && ball.x >= barLeft && ball.x <= barRight
    );
  }

  private handleBallTouchingBar(
    ball: Ball,
    player: GamePlayerModel,
    yPosition: number,
  ): void {
    const bar: Bar = player.bar;
    this.touchLog.push(new GameLog(player.id, this.round, 'touch', ball));
    ball.touchBar(bar);
    ball.setPosition(ball.x, yPosition);
  }

  // 디버깅용
  isPastBallPos(x: number, y: number): boolean {
    for (const c of this.pastBallPosition) {
      if (x === Math.round(c.x) && y === Math.round(c.y)) {
        return true;
      }
    }
    return false;
  }

  // 디버깅용
  drow(): void {
    const x = this.ball.x;
    const y = this.ball.y;
    const ball = '●';
    const pastBallPosition = '○';
    const bar = '▣';
    const space = ' ';
    const line = '|\n';
    const boardWidth = +process.env.BOARD_WIDTH;
    const boardHeight = +process.env.BOARD_HEIGHT;

    let result = '';
    for (let i = 0; i < boardHeight; i++) {
      for (let j = 0; j < boardWidth + 1; j++) {
        if (j === 0) {
          result += '|';
        } else if (i === Math.round(y) && j === Math.round(x)) {
          result += ball;
        } else if (this.isPastBallPos(j, i)) {
          result += pastBallPosition;
        } else if (
          i === 0 &&
          j < this.player1.bar.width / 2 + this.player1.bar.position &&
          j - 1 >= this.player1.bar.position - this.player1.bar.width / 2
        ) {
          result += bar;
        } else if (
          i === boardHeight - 1 &&
          j < this.player2.bar.width / 2 + this.player2.bar.position &&
          j - 1 >= this.player2.bar.position - this.player2.bar.width / 2
        ) {
          result += bar;
        } else {
          result += space;
        }
      }
      result += line;
    }
    console.log(
      result,
      'ball_position: ',
      this.ball.x,
      this.ball.y,
      this.ball.spinSpeed,
      '\nscore - player1: ',
      this.player1.score,
      'score - player2: ',
      this.player2.score,
    );
  }
}
