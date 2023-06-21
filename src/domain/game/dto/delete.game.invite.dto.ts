import { GameMode } from 'src/global/type/type.game.mode';

export class DeleteGameInviteDto {
  sender: number;
  receiver: number;
  mode: GameMode;

  constructor(sender: number, receiver: number, mode: GameMode) {
    this.sender = sender;
    this.receiver = receiver;
    this.mode = mode;
  }
}
