import { Injectable } from '@nestjs/common';
import { UserModel } from './model/user.model';
import { UserStatusType } from 'src/global/type/type.user.status';
import { InviteModel } from './model/invite.model';

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

  invite(userId: number, invite: InviteModel): void {
    const user: UserModel = this.findById(userId);
    user.invite = invite;
  }

  uninvite(sender: UserModel, receiver: UserModel): void {
    sender.invite = null;
    receiver.inviteList.delete(sender.invite.id);
  }

  getInvites(userId: number): InviteModel[] {
    const user: UserModel = this.findById(userId);
    return Array.from(user.inviteList.values());
  }

  deleteInvite(userId: number, gameId: string): void {
    const user: UserModel = this.findById(userId);
    user.inviteList.delete(gameId);
  }
}
