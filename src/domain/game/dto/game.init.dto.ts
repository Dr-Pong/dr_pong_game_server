import { GamePlayerModel } from 'src/domain/factory/model/game-player.model';
import { GameModel } from 'src/domain/factory/model/game.model';
import { UserModel } from 'src/domain/factory/model/user.model';
import * as dotenv from 'dotenv';

dotenv.config();

export class GameInitDto {
  me: {
    x: number;
    y: number;
    width: number;
    height: number;
    score: number;
  };
  opponent: {
    x: number;
    y: number;
    width: number;
    height: number;
    score: number;
  };
  ball: {
    x: number;
    y: number;
    size: number;
  };
  server: boolean;
  round: number;
  gameTime: number;

  constructor(game: GameModel, user: UserModel) {
    const me: GamePlayerModel =
      game.player1.id === user.id ? game.player1 : game.player2;
    const opponent: GamePlayerModel =
      game.player1.id === user.id ? game.player2 : game.player1;
    this.me = {
      x: me.bar.position / game.board.width,
      y: (game.board.height - 1.5) / game.board.height,
      width: me.bar.width / game.board.width,
      height: 1.5 / game.board.height,
      score: me.score,
    };
    this.opponent = {
      x: opponent.bar.position / game.board.width,
      y: 0,
      width: opponent.bar.width / game.board.width,
      height: 1.5 / game.board.height,
      score: opponent.score,
    };
    this.ball = {
      x: game.ball.x / game.board.width,
      y: game.ball.y / game.board.height,
      size: game.ball.size / game.board.height,
    };
    this.server =
      game.round % 2 === 1
        ? user.id === game.player1.id
        : user.id === game.player2.id;
    this.round = game.round;
    this.gameTime = +process.env.GAME_TIME - game.playTime;
  }
}
