import { GameMode } from 'src/global/type/type.game.mode';

export class PostGameInviteDto {
  sender: number;
  receiver: number;
  mode: GameMode;
}
