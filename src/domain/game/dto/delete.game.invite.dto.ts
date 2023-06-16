import { GameMode } from 'src/global/type/type.game.mode';

export class DeleteGameInviteDto {
  sender: number;
  receiver: number;
  mode: GameMode;
}
