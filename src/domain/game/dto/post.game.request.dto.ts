import { GameMode } from 'src/global/type/type.game.mode';
import { GameType } from 'src/global/type/type.game.type';

export class PostGameRequestDto {
  user1Id: number;
  user2Id: number;
  type: GameType;
  mode: GameMode;
}
