import { Injectable } from '@nestjs/common';
import { UserModel } from './model/user.model';
import { UserStatusType } from 'src/global/type/type.user.status';
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

  create(user: UserModel): UserModel {
    this.users.set(user.id, user);
    return user;
  }

  setSocket(userId: number, gatewayType: string, socket: Socket): void {
    const user: UserModel = this.findById(userId);
    user.socket[gatewayType] = socket;
  }

  setGameId(userId: number, gameId: string): void {
    const user: UserModel = this.findById(userId);
    user.gameId = gameId;
  }

  setLadderPoint(userId: number, ladderPoint: number): void {
    const user: UserModel = this.findById(userId);
    user.ladderPoint = ladderPoint;
  }

  deleteGameId(userId: number): void {
    const user: UserModel = this.findById(userId);
    user.gameId = null;
    user.socket['game'] = null;
  }
}
