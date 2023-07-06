import { GameModel } from 'src/domain/factory/model/game.model';

export class GameRoundUpdateDto {
  round: number;
  me: number;
  opponent: number;

  constructor(game: GameModel, userId: number) {
    this.round = game.round;
    if (game.player1.id === userId) {
      this.me = game.player1.score;
      this.opponent = game.player2.score;
    } else {
      this.me = game.player2.score;
      this.opponent = game.player1.score;
    }
  }
}
