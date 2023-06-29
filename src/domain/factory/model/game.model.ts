import { GameMode } from 'src/global/type/type.game.mode';
import { v4 as uuid } from 'uuid';
import { GameBoard } from '../objects/game-board';
import { Ball } from '../objects/ball';
import { GamePlayerModel } from './game-player.model';
import { UserModel } from './user.model';
import { GameLog } from './game.log';
import { Bar } from '../objects/bar';

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
  log: GameLog[];

  constructor(player1: UserModel, player2: UserModel, mode: GameMode) {
    this.id = uuid();
    this.mode = mode;
    this.player1 = new GamePlayerModel(player1.id, player1.nickname);
    this.player2 = new GamePlayerModel(player2.id, player2.nickname);
    this.board = new GameBoard(+process.env.WIDTH, +process.env.HIEGHT);
    this.ball = new Ball(+process.env.BALL_SIZE, +process.env.BALL_SPEED);
    this.startTime = new Date();
    this.round = 1;
    this.status = 'standby';
    this.log = [];
  }

  start(): GameModel {
    if (this.status !== 'end') {
      this.status = 'playing';
      this.gameLoop();
    }
    return this;
  }

  end(): void {
    this.status = 'end';
    this.endTime = new Date();
  }

  reset(): void {
    this.ball.reset(this.round % 2 === 0 ? 1 : -1);
    this.player1.bar.reset();
    this.player2.bar.reset();
    this.status = 'standby';
    setTimeout(() => {
      this.status = 'playing';
      this.gameLoop();
    }, 3000);
  }

  gameLoop(): void {
    if (this.status === 'end') {
      return;
    }
    this.move();
    this.handleTouchEvent();
    this.handleGoal();
    setTimeout(() => {
      this.gameLoop();
    }, 1000 / 60);
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

    if (player.id === this.player1.id && this.isBallTouchingBar(ball, bar, 0)) {
      this.handleBallTouchingBar(ball, player, ball.size);
    }

    if (
      player.id === this.player2.id &&
      this.isBallTouchingBar(ball, bar, this.board.height)
    ) {
      this.handleBallTouchingBar(ball, player, this.board.height - ball.size);
    }
  }

  handleTouchWall(): void {
    const ball: Ball = this.ball;

    if (ball.x - ball.size <= 0) {
      ball.touchWall();
      ball.setPosition(ball.size, ball.y);
    }
    if (ball.x + ball.size >= this.board.width) {
      ball.touchWall();
      ball.setPosition(this.board.width - ball.x, ball.y);
    }
  }

  handleGoal(): void {
    const ball: Ball = this.ball;
    const player1Win: boolean = ball.y - ball.size <= 0;
    const player2Win: boolean = ball.y + ball.size >= this.board.height;

    if (player1Win) {
      this.player1.score++;
      this.log.push(new GameLog(this.player1.id, this.round, 'score'));
      this.round++;
    }

    if (player2Win) {
      this.player2.score++;
      this.log.push(new GameLog(this.player2.id, this.round, 'score'));
      this.round++;
    }
    if (this.checkGameEnd()) return this.end();
    if (player1Win || player2Win) this.reset();
  }

  checkGameEnd(): boolean {
    return this.player1.score === 5 || this.player2.score === 5;
  }

  private isBallTouchingBar(ball: Ball, bar: Bar, yPosition: number): boolean {
    const barLeft: number = bar.position - bar.width / 2;
    const barRight: number = bar.position + bar.width / 2;

    return (
      ball.y - ball.size <= yPosition &&
      ball.x - ball.size >= barLeft &&
      ball.x + ball.size <= barRight
    );
  }

  private handleBallTouchingBar(
    ball: Ball,
    player: GamePlayerModel,
    yPosition: number,
  ): void {
    const bar: Bar = player.bar;
    this.log.push(new GameLog(player.id, this.round, 'touch'));
    ball.touchBar(bar);
    ball.setPosition(ball.x, yPosition);
  }
}
