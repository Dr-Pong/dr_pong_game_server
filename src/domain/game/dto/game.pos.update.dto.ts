import { GameModel } from 'src/domain/factory/model/game.model';
import * as dotenv from 'dotenv';

dotenv.config();

export class GamePosUpdateDto {
  ballPos: { x: number; y: number };
  playerXPos: {
    me: number;
    opponent: number;
  };
  gameTime: number;

  constructor(game: GameModel, userId: number) {
    if (game.player1.id === userId) {
      this.ballPos = {
        x: game.ball.x / game.board.width,
        y: game.ball.y / game.board.height,
      };
      this.playerXPos = {
        me: game.player1.bar.position / game.board.width,
        opponent: game.player2.bar.position / game.board.width,
      };
    } else {
      this.ballPos = {
        x: (game.board.width - game.ball.x) / game.board.width,
        y: (game.board.height - game.ball.y) / game.board.height,
      };
      this.playerXPos = {
        me: (game.board.width - game.player2.bar.position) / game.board.width,
        opponent:
          (game.board.width - game.player1.bar.position) / game.board.width,
      };
    }
    this.gameTime = +process.env.GAME_TIME - game.playTime;
  }
}
