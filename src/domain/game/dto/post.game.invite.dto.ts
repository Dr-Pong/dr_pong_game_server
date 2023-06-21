import { GameMode } from 'src/global/type/type.game.mode';

export class PostGameInviteDto {
  senderId: number;
  receiverId: number;
  mode: GameMode;

  constructor(sender: number, receiver: number, mode: GameMode) {
    this.senderId = sender;
    this.receiverId = receiver;
    this.mode = mode;
  }
}
