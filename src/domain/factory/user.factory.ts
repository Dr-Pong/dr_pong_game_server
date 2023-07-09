import { Injectable } from '@nestjs/common';
import { UserModel } from './model/user.model';
import { UserStatusType } from 'src/global/type/type.user.status';
import { InviteModel } from './model/invite.model';
import { Socket } from 'socket.io';

@Injectable()
export class UserFactory {
  users: Map<number, UserModel> = new Map();

  findById(id: number): UserModel {
    return this.users.get(id);
  }

  findByNickname(nickname: string): UserModel {
    return Array.from(this.users.values()).find(
      (user: UserModel) => user.nickname === nickname,
    );
  }

  create(user: UserModel): void {
    this.users.set(user.id, user);
  }

  setStatus(userId: number, status: UserStatusType): void {
    const user: UserModel = this.findById(userId);
    user.status = status;
  }

  setSocket(userId: number, gatewayType: string, socket: Socket): void {
    const user: UserModel = this.findById(userId);
    user.socket[gatewayType] = socket;
  }

  setGameId(userId: number, gameId: string): void {
    const user: UserModel = this.findById(userId);
    user.gameId = gameId;
  }

  invite(senderId: number, receiverId: number, invite: InviteModel): void {
    const sender: UserModel = this.findById(senderId);
    const receiver: UserModel = this.findById(receiverId);
    receiver.inviteList.set(invite.id, invite);
    sender.invite = invite;
  }

  getInvites(userId: number): InviteModel[] {
    const user: UserModel = this.findById(userId);
    return Array.from(user.inviteList.values());
  }

  deleteInvite(senderId: number, receiverId: number): void {
    const sender: UserModel = this.findById(senderId);
    const receiver: UserModel = this.findById(receiverId);
    receiver.inviteList.delete(sender.invite.id);
    sender.invite = null;
  }
}
