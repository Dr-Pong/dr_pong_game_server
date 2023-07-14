import { Injectable } from '@nestjs/common';
import { GameModel } from './model/game.model';

@Injectable()
export class GameFactory {
  games: Map<string, GameModel> = new Map<string, GameModel>();

  create(game: GameModel): GameModel {
    this.games.set(game.id, game);
    return game;
  }

  findById(id: string): GameModel {
    return this.games.get(id);
  }

  delete(id: string): void {
    this.games.delete(id);
  }
}
