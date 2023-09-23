import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { GameFactory } from '../factory/game.factory';
import { Server, Socket } from 'socket.io';
import { UserModel } from '../factory/model/user.model';
import { GameModel } from '../factory/model/game.model';
import { GamePlayerModel } from '../factory/model/game-player.model';
import { GameInitDto } from '../game/dto/game.init.dto';
import { Mutex } from 'async-mutex';
import { Bar } from '../factory/objects/bar';
import { GameLog } from '../factory/model/game.log';
import { Ball } from '../factory/objects/ball';
import { sleep } from 'src/global/utils/sleep';
import { GamePosUpdateDto } from '../game/dto/game.pos.update.dto';
import { GameRoundUpdateDto } from '../game/dto/game.round.update.dto';
import { GAMEMODE_RANDOMBOUNCE } from 'src/global/type/type.game.mode';
import {
  checkAchievementAndTitle,
  getUserFromSocket,
  patchUserStatesInGame,
  patchUserStatesOutOfGame,
} from 'src/global/utils/socket.utils';
import { UserInitDto } from '../game/dto/user.init.dto';
import { RedisUserRepository } from '../redis/redis.user.repository';
import { MutexManager } from '../mutex/mutex.manager';

@WebSocketGateway({ namespace: 'game' })
export class GameGateWay implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly gameFactory: GameFactory,
    private readonly mutexManager: MutexManager,
    private readonly redisUserRepository: RedisUserRepository,
  ) {}
  @WebSocketServer()
  server: Server;

  async handleConnection(@ConnectedSocket() socket: Socket) {
    const mutex: Mutex = this.mutexManager.getMutex('gameSocket');
    const release = await mutex.acquire();
    try {
      const user: UserModel = await getUserFromSocket(
        socket,
        this.redisUserRepository,
      );
      if (!user) {
        socket.disconnect();
        return;
      }
      await this.setUserInFactory(user, socket);
    } finally {
      release();
    }
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    // console.log('disconnect', socket.id);
  }

  @SubscribeMessage('keyPress')
  async handleKeyPress(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomId: string; key: 'left' | 'right' },
  ): Promise<void> {
    const user: UserModel = await getUserFromSocket(
      socket,
      this.redisUserRepository,
    );
    if (!user) {
      socket.disconnect();
      return;
    }
    const game: GameModel = await this.gameFactory.findById(data.roomId);
    if (!game) {
      socket.disconnect();
      return;
    }
    this.changeBarDirection(game.id, user.id, data.key);
  }

  @SubscribeMessage('keyRelease')
  async handleKeyRelease(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomId: string; key: 'left' | 'right' },
  ): Promise<void> {
    const user: UserModel = await getUserFromSocket(
      socket,
      this.redisUserRepository,
    );
    if (!user) {
      socket.disconnect();
      return;
    }
    const game: GameModel = this.gameFactory.findById(data.roomId);
    if (!game) {
      socket.disconnect();
      return;
    }
    this.stopBar(game, user.id, data.key);
  }

  @SubscribeMessage('myEmoji')
  async handleMyEmoji(
    @ConnectedSocket() socket: Socket,
    @MessageBody() url: string,
  ): Promise<void> {
    const user: UserModel = await getUserFromSocket(
      socket,
      this.redisUserRepository,
    );
    if (!user) {
      socket.disconnect();
      return;
    }
    const game: GameModel = this.gameFactory.findById(
      (await this.redisUserRepository.findById(user.id)).gameId,
    );
    if (!game) {
      socket.disconnect();
      return;
    }
    if (game.player1.id === user.id) {
      game.player1.socket?.emit('myEmoji', url);
      game.player2.socket?.emit('opponentEmoji', url);
    }
    if (game.player2.id === user.id) {
      game.player1.socket?.emit('opponentEmoji', url);
      game.player2.socket?.emit('myEmoji', url);
    }
  }

  @SubscribeMessage('joinGame')
  async validateGameId(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomId: string },
  ): Promise<void> {
    const mutex: Mutex = this.mutexManager.getMutex('joinGame');
    const release = await mutex.acquire();
    try {
      const user: UserModel = await getUserFromSocket(
        socket,
        this.redisUserRepository,
      );
      if (!user || user.gameId !== data?.roomId) {
        socket?.emit('invalidGameId', {});
        socket.disconnect();
        return;
      }
      const game: GameModel = this.gameFactory.findById(user.gameId);
      this.setUserIsReady(user.id, game, true);
      this.setUserInGame(user, socket);
      if (game.status === 'standby') {
        await this.start(game);
      }
      await patchUserStatesInGame(game, user);
    } finally {
      release();
    }
  }

  private async setUserInFactory(
    user: UserModel,
    socket: Socket,
  ): Promise<void> {
    if (user.gameSocket && user.gameSocket !== socket.id) {
      this.server.to(user.gameSocket)?.emit('multiConnect', {});
      this.server.in(user.gameSocket)?.disconnectSockets(true);
      return;
    }
    await this.redisUserRepository.setSocket(user.id, 'game', socket);
  }

  private setUserInGame(user: UserModel, socket: Socket) {
    const game: GameModel = this.gameFactory.findById(user.gameId);
    if (game.player1.id === user.id) {
      game.player1.socket = socket;
    } else {
      game.player2.socket = socket;
    }
    this.sendGameInfo(user, game);
  }

  private sendGameInfo(user: UserModel, game: GameModel): void {
    const gamePlayer: GamePlayerModel =
      game.player1.id === user.id ? game.player1 : game.player2;
    const opponent: GamePlayerModel =
      game.player1.id === user.id ? game.player2 : game.player1;

    gamePlayer.socket?.emit('userInit', new UserInitDto(gamePlayer, opponent));
    gamePlayer.socket?.emit('gameInit', new GameInitDto(game, user));
  }

  setUserIsReady(userId: number, game: GameModel, isReady: boolean): void {
    if (game.player1.id === userId) {
      game.player1.isReady = isReady;
    }
    if (game.player2.id === userId) {
      game.player2.isReady = isReady;
    }
  }

  async start(game: GameModel): Promise<void> {
    if (!game.player1.isReady || !game.player2.isReady) {
      return;
    }
    if (game.status !== 'playing') {
      await this.sendStartTimer(game);
      game.status = 'playing';
      game.startTime = new Date();
      game.timer = Date.now();
      this.gameLoop(game);
    }
  }

  async gameLoop(game: GameModel): Promise<void> {
    if (game.status !== 'playing') {
      return;
    }
    this.move(game);
    this.handleTouchEvent(game);
    if (game.frame % 2 === 0) this.sendPositionUpdate(game);
    await this.handleGoal(game, game.ball);
    this.setPlayTime(game);
    game.frame++;
    setTimeout(() => {
      this.gameLoop(game);
    }, 1000 / +process.env.GAME_FRAME);
  }

  setPlayTime(game: GameModel): void {
    game.playTime += Date.now() - game.timer;
    game.timer = Date.now();
  }

  move(game: GameModel): void {
    game.ball.move();
    game.player1.bar.move();
    game.player2.bar.move();
  }

  handleTouchEvent(game: GameModel): void {
    this.handleTouchBar(game, game.player1, game.ball);
    this.handleTouchBar(game, game.player2, game.ball);
    this.handleTouchWall(game, game.ball);
  }

  handleTouchBar(game: GameModel, player: GamePlayerModel, ball: Ball): void {
    // user2 바 체크
    if (ball.isTouchingBar(player.bar)) {
      this.handleBallTouchingBar(game, ball, player);
    }
  }

  handleTouchWall(game: GameModel, ball: Ball): void {
    // 왼쪽 벽 체크
    if (ball.x - ball.size / 2 <= 0) {
      ball.touchWall();
      this.sendTouchWallEvent(game);
    }
    // 오른쪽 벽 체크
    if (ball.x + ball.size / 2 >= game.board.width) {
      ball.touchWall();
      this.sendTouchWallEvent(game);
    }
  }

  async handleGoal(game: GameModel, ball: Ball): Promise<void> {
    const player1Win: boolean = ball.y + ball.size / 2 < 0;

    const player2Win: boolean = ball.y - ball.size / 2 > game.board.height;

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
      await this.endGame(game);
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
      game.playTime >= +process.env.GAME_TIME
    );
  }

  async resetGame(game: GameModel): Promise<void> {
    game.ball.reset(game.round % 2 === 1 ? 1 : -1);
    game.player1.bar.reset();
    game.player2.bar.reset();
    game.pastBallPosition = [];
    await this.sendStartTimer(game);
    game.timer = Date.now();
    game.status = 'playing';
  }

  sendTouchWallEvent(game: GameModel): void {
    game.player1.socket?.emit('wallTouch', {});
    game.player2.socket?.emit('wallTouch', {});
  }

  async sendTouchBarEvent(bar: Bar, game: GameModel): Promise<void> {
    if (bar.movedDistance !== 0) {
      game.player1.socket?.emit('spin', {});
      game.player2.socket?.emit('spin', {});
      return;
    } else {
      game.player1.socket?.emit('barTouch', {});
      game.player2.socket?.emit('barTouch', {});
    }
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

  async changeBarDirection(
    gameId: string,
    userId: number,
    direction: 'left' | 'right',
  ): Promise<void> {
    const game: GameModel = this.gameFactory.findById(gameId);
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

  async stopBar(
    game: GameModel,
    userId: number,
    direction: 'left' | 'right',
  ): Promise<void> {
    if (game.status !== 'playing') {
      return;
    }

    if (
      game.player1.id === userId &&
      game.player1.bar.direction === direction
    ) {
      game.player1.bar.stop();
    }
    if (
      game.player2.id === userId &&
      game.player2.bar.direction !== direction
    ) {
      game.player2.bar.stop();
    }
  }

  async endGame(game: GameModel): Promise<void> {
    game.status = 'end';
    game.endTime = new Date();
    await checkAchievementAndTitle(game);
    await patchUserStatesOutOfGame(game);
    await this.sendGameEnd(game);
    await this.redisUserRepository.deleteGameId(game.player1.id);
    await this.redisUserRepository.deleteGameId(game.player2.id);
    this.gameFactory.delete(game.id);
  }

  async exitGame(game: GameModel): Promise<void> {
    game.player1.socket?.emit('endGame', {});
    game.player2.socket?.emit('endGame', {});
    game.player1.socket?.disconnect();
    game.player2.socket?.disconnect();
  }

  private async sendGameEnd(game: GameModel): Promise<void> {
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

  private handleBallTouchingBar(
    game: GameModel,
    ball: Ball,
    player: GamePlayerModel,
  ): void {
    const bar: Bar = player.bar;
    game.touchLog.push(new GameLog(player.id, game.round, 'touch', ball));
    ball.touchBar(bar);
    if (game.mode === GAMEMODE_RANDOMBOUNCE) {
      ball.randomBounce(game.randomSeed[game.seedIndex]);
      game.seedIndex++;
    }
    this.sendTouchBarEvent(bar, game);
  }
}
