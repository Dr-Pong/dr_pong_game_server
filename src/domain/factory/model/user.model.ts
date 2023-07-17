import { Socket } from 'socket.io';
import {
  USERSTATUS_NOT_IN_GAME,
  UserStatusType,
} from 'src/global/type/type.user.status';
import { InviteModel } from './invite.model';
import { User } from 'src/domain/user/user.entity';

export class UserModel {
  id: number;
  nickname: string;
  ladderPoint: number;
  socket: Map<string, Socket>;
  invite: InviteModel;
  inviteList: Map<string, InviteModel>;
  status: UserStatusType;
  gameId: string;

  static fromEntity(entity: User): UserModel {
    const { id, nickname } = entity;
    return new UserModel(id, nickname);
  }

  constructor(id: number, nickname: string) {
    this.id = id;
    this.nickname = nickname;
    this.ladderPoint = null;
    this.socket = new Map<string, Socket>();
    this.invite = null;
    this.inviteList = new Map();
    this.status = USERSTATUS_NOT_IN_GAME;
    this.gameId = null;
  }
}
