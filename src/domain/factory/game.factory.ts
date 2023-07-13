import { Injectable } from '@nestjs/common';
import { GameModel } from './model/game.model';
import { Bar } from './objects/bar';
import { GamePlayerModel } from './model/game-player.model';
import { Ball } from './objects/ball';
import { GameLog } from './model/game.log';
import axios from 'axios';
import { PostGameRecordDto } from '../game/dto/post.game.record.dto';
import { USERSTATUS_NOT_IN_GAME } from 'src/global/type/type.user.status';
import { GamePosUpdateDto } from '../game/dto/game.pos.update.dto';
import { GameRoundUpdateDto } from '../game/dto/game.round.update.dto';
import { sleep } from '../../global/utils/sleep';
import { UserFactory } from './user.factory';
import { UserModel } from './model/user.model';

@Injectable()
export class GameFactory {
  constructor(private readonly userFactory: UserFactory) {}
  private games: Map<string, GameModel> = new Map<string, GameModel>();

  create(game: GameModel): GameModel {
    this.games.set(game.id, game);
    return game;
  }

  findById(id: string): GameModel {
    return this.games.get(id);
  }

  setUserIsReady(userId: number, gameId: string, isReady: boolean): void {
    const game: GameModel = this.findById(gameId);
    if (!game) {
      return;
    }
    if (game.player1.id === userId) {
      game.player1.isReady = isReady;
    }
    if (game.player2.id === userId) {
      game.player2.isReady = isReady;
    }
  }

  async start(gameId: string): Promise<void> {
    const game: GameModel = this.findById(gameId);
    if (!game.player1.isReady || !game.player2.isReady) {
      return;
    }
    await this.sendStartTimer(game);
    if (game.status !== 'playing') {
      game.status = 'playing';
      this.gameLoop(game);
    }
  }

  async gameLoop(game: GameModel): Promise<void> {
    if (game.status !== 'playing') {
      return;
    }
    this.move(game);
    this.handleTouchEvent(game);
    await this.handleGoal(game);
    this.sendPositionUpdate(game);
    setTimeout(() => {
      this.gameLoop(game);
    }, 1000 / +process.env.GAME_FRAME);
  }

  move(game: GameModel): void {
    game.ball.move();
    game.player1.bar.move();
    game.player2.bar.move();
    console.log({ x: game.ball.x, y: game.ball.y });
  }

  handleTouchEvent(game: GameModel): void {
    this.handleTouchBar(game, game.player1);
    this.handleTouchBar(game, game.player2);
    this.handleTouchWall(game);
  }

  handleTouchBar(game: GameModel, player: GamePlayerModel): void {
    const bar: Bar = player.bar;
    const ball: Ball = game.ball;

    // user2 바 체크
    if (
      player.id === game.player2.id &&
      this.isBallTouchingBar(ball, bar, 1.5 / +process.env.BOARD_HEIGHT)
    ) {
      this.handleBallTouchingBar(
        game,
        ball,
        player,
        1.5 / game.board.height + ball.size / 2,
      );
    }

    //  user1 바 체크
    if (
      player.id === game.player1.id &&
      this.isBallTouchingBar(
        ball,
        bar,
        game.board.height - 1.5 / game.board.height,
      )
    ) {
      this.handleBallTouchingBar(
        game,
        ball,
        player,
        game.board.height - 1.5 / game.board.height - ball.size / 2,
      );
    }
  }

  handleTouchWall(game: GameModel): void {
    const ball: Ball = game.ball;
    // 왼쪽 벽 체크
    if (ball.x - ball.size / 2 <= 0) {
      ball.touchWall();
      ball.setPosition(ball.size / 2, ball.y);
    }
    // 오른쪽 벽 체크
    if (ball.x + ball.size / 2 >= game.board.width) {
      ball.touchWall();
      ball.setPosition(game.board.width - ball.size / 2, ball.y);
    }
  }

  async handleGoal(game: GameModel): Promise<void> {
    const ball: Ball = game.ball;
    const player1Win: boolean = ball.y - ball.size / 2 < 0;

    const player2Win: boolean = ball.y + ball.size / 2 > game.board.height;

    if (player1Win) {
      game.player1.score++;
      game.touchLog.push(
        new GameLog(game.player1.id, game.round, 'score', ball),
      );
      game.round++;
      this.sendRoundUpdate(game);
    }

    if (player2Win) {
      game.player2.score++;
      game.touchLog.push(
        new GameLog(game.player2.id, game.round, 'score', ball),
      );
      game.round++;
      this.sendRoundUpdate(game);
    }
    if (this.checkGameEnd(game)) {
      this.endGame(game);
      return;
    }
    if (player1Win || player2Win) {
      await sleep(1);
      await this.resetGame(game);
    }
  }

  checkGameEnd(game: GameModel): boolean {
    return (
      game.player1.score === +process.env.GAME_FINISH_SCORE ||
      game.player2.score === +process.env.GAME_FINISH_SCORE ||
      game.startTime.getTime() + +process.env.GAME_TIME < Date.now()
    );
  }

  async resetGame(game: GameModel): Promise<void> {
    game.status = 'standby';
    game.ball.reset(game.round % 2 === 0 ? 1 : -1);
    console.log('game.ball', {
      vector: { x: game.ball.direction.x, y: game.ball.direction.y },
      vectorSize: game.ball.direction.x ** 2 + game.ball.direction.y ** 2,
    });
    game.player1.bar.reset();
    game.player2.bar.reset();
    game.pastBallPosition = [];
    await this.sendStartTimer(game);
    game.status = 'playing';
  }

  sendPositionUpdate(game: GameModel): void {
    game.player1.socket?.emit(
      'posUpdate',
      new GamePosUpdateDto(game, game.player1.id),
    );
    game.player2.socket?.emit(
      'posUpdate',
      new GamePosUpdateDto(game, game.player2.id),
    );
  }

  sendRoundUpdate(game: GameModel): void {
    game.player1.socket?.emit(
      'roundUpdate',
      new GameRoundUpdateDto(game, game.player1.id),
    );
    game.player2.socket?.emit(
      'roundUpdate',
      new GameRoundUpdateDto(game, game.player2.id),
    );
  }

  async handelKeyPress(
    gameId: string,
    userId: number,
    direction: 'left' | 'right',
  ): Promise<void> {
    const game: GameModel = this.findById(gameId);
    if (game.status !== 'playing') {
      return;
    }
    if (game.player1.id === userId) {
      game.player1.bar.direction = direction;
    }
    if (game.player2.id === userId) {
      game.player2.bar.direction = direction === 'left' ? 'right' : 'left';
    }
  }

  async handelKeyRelease(
    gameId: string,
    userId: number,
    direction: 'left' | 'right',
  ): Promise<void> {
    const game: GameModel = this.findById(gameId);
    if (
      game.player1.id === userId &&
      game.player1.bar.direction === direction
    ) {
      game.player1.bar.direction = 'stop';
    }
    if (
      game.player2.id === userId &&
      game.player2.bar.direction !== direction
    ) {
      game.player2.bar.direction = 'stop';
    }
  }

  async endGame(game: GameModel): Promise<void> {
    game.status = 'end';
    game.endTime = new Date();
    try {
      await axios.post(
        `${process.env.WEB_URL}/games`,
        new PostGameRecordDto(game),
      );
    } catch (e) {
      console.log(e?.response?.data);
    }
    try {
      await axios.patch(`${process.env.CHAT_URL}/users/state`, {
        userId: game.player1.id,
        state: USERSTATUS_NOT_IN_GAME,
      });
      await axios.patch(`${process.env.CHAT_URL}/users/state`, {
        userId: game.player2.id,
        state: USERSTATUS_NOT_IN_GAME,
      });
    } catch (e) {
      console.log(e?.response?.data);
    }
    this.sendGameEnd(game);
    const player1: UserModel = this.userFactory.findById(game.player1.id);
    const player2: UserModel = this.userFactory.findById(game.player2.id);
    player1.gameId = null;
    player2.gameId = null;
    this.games.delete(game.id);
  }

  private sendGameEnd(game: GameModel): void {
    let player1Result =
      game.player1.score > game.player2.score ? 'win' : 'lose';
    let player2Result =
      game.player1.score < game.player2.score ? 'win' : 'lose';
    if (game.player1.score === game.player2.score) {
      player1Result = 'tie';
      player2Result = 'tie';
    }

    game.player1.socket?.emit('gameEnd', { result: player1Result });
    game.player2.socket?.emit('gameEnd', { result: player2Result });
  }

  private async sendStartTimer(game: GameModel): Promise<void> {
    for (let i = 0; i <= +process.env.GAME_START_DELAY; i++) {
      game.player1.socket?.emit('time', {
        time: +process.env.GAME_START_DELAY - i,
      });
      game.player2.socket?.emit('time', {
        time: +process.env.GAME_START_DELAY - i,
      });
      await sleep(1);
    }
    game.player1.socket?.emit('time', {
      time: -1,
    });
    game.player2.socket?.emit('time', {
      time: -1,
    });
  }

  private isBallTouchingBar(ball: Ball, bar: Bar, yPosition: number): boolean {
    const barLeft: number = bar.position - bar.width / 2;
    const barRight: number = bar.position + bar.width / 2;

    // 위쪽과 아래쪽을 체크
    if (yPosition === 1.5 / +process.env.BOARD_HEIGHT)
      return (
        ball.y - ball.size / 2 <= yPosition &&
        ball.x >= barLeft &&
        ball.x <= barRight
      );
    return (
      ball.y + ball.size / 2 >= yPosition &&
      ball.x >= barLeft &&
      ball.x <= barRight
    );
  }

  private handleBallTouchingBar(
    game: GameModel,
    ball: Ball,
    player: GamePlayerModel,
    yPosition: number,
  ): void {
    const bar: Bar = player.bar;
    game.touchLog.push(new GameLog(player.id, game.round, 'touch', ball));
    ball.touchBar(bar);
    ball.setPosition(ball.x, yPosition);
  }
}
