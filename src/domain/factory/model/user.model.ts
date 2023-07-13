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
    const { id, nickname, ladderPoint } = entity;
    return new UserModel(id, nickname, ladderPoint);
  }

  constructor(id: number, nickname: string, ladderPoint: number) {
    this.id = id;
    this.nickname = nickname;
    this.ladderPoint = ladderPoint;
    this.socket = new Map();
    this.invite = null;
    this.inviteList = new Map();
    this.status = USERSTATUS_NOT_IN_GAME;
    this.gameId = null;
  }
}
