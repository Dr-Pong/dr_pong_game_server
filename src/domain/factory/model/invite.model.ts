import { v4 as uuid } from 'uuid';

export class InviteModel {
  id: string;
  senderId: number;
  receiverId: number;
  createdAt: Date;

  constructor(senderId: number, receiverId: number) {
    this.id = uuid();
    this.senderId = senderId;
    this.receiverId = receiverId;
    this.createdAt = new Date();
  }
}
