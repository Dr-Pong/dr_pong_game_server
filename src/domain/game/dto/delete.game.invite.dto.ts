export class DeleteGameInviteDto {
  senderId: number;
  receiverId: number;

  constructor(sender: number, receiver: number) {
    this.senderId = sender;
    this.receiverId = receiver;
  }
}
