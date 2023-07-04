import { GameModel } from 'src/domain/factory/model/game.model';

export class GamePosUpdateDto {
  ballPos: { x: number; y: number };
  playerXPos: {
    me: number;
    opponent: number;
  };

  constructor(game: GameModel, userId: number) {
    if (game.player1.id === userId) {
      this.ballPos = { x: game.ball.x, y: game.ball.y };
      this.playerXPos = {
        me: game.player1.bar.position,
        opponent: game.player2.bar.position,
      };
    } else {
      this.ballPos = {
        x: +process.env.BOARD_WIDTH - game.ball.x,
        y: +process.env.BOARD_HEIGHT - game.ball.y,
      };
      this.playerXPos = {
        me: +process.env.BOARD_WIDTH - game.player2.bar.position,
        opponent: +process.env.BOARD_WIDTH - game.player1.bar.position,
      };
    }
  }
}
