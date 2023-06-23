export class DeleteGameInviteDto {
  senderId: number;

  constructor(sender: number) {
    this.senderId = sender;
  }
}
