import { Socket } from 'socket.io';
import { KeyManager } from 'src/domain/redis/util/redis.key.manager';
import { User } from 'src/domain/user/user.entity';

export class UserModel {
  id: number;
  nickname: string;
  imgUrl: string;
  title: string;
  ladderPoint: number;
  socket: Map<string, Socket>;
  gameId: string;

  static fromEntity(entity: User): UserModel {
    const { id, nickname } = entity;
    return new UserModel(id, nickname);
  }

  constructor(id: number, nickname: string) {
    this.id = id;
    this.nickname = nickname;
    this.imgUrl = null;
    this.title = null;
    this.ladderPoint = null;
    this.socket = new Map<string, Socket>();
    this.gameId = null;
  }

  toString(): string {
    return JSON.stringify(this);
  }

  getRedisKeyId(): string {
    return KeyManager.generateUserIdKey(this.id);
  }

  getRedisKeyNickname(): string {
    return KeyManager.generateUserNickNameKey(this.nickname);
  }
}
