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

  create(user: UserModel): void {
    this.users.set(user.id, user);
  }

  setStatus(userId: number, status: UserStatusType): void {
    const user: UserModel = this.findById(userId);
    user.status = status;
    this.users.set(user.id, user);
  }

  invite(userId: number, invite: InviteModel): void {
    const user: UserModel = this.findById(userId);
    user.invite = invite;
    this.users.set(user.id, user);
  }

  getInvites(userId: number): InviteModel[] {
    const user: UserModel = this.findById(userId);
    return Array.from(user.inviteList.values());
  }

  deleteInvite(userId: number, channelId: string): void {
    const user: UserModel = this.findById(userId);
    user.inviteList.delete(channelId);
    this.users.set(user.id, user);
  }
}
