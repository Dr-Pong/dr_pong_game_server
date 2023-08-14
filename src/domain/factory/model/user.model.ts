import { KeyManager } from 'src/domain/redis/util/redis.key.manager';
import { User } from 'src/domain/user/user.entity';

export class UserModel {
  id: number;
  nickname: string;
  imgUrl: string;
  title: string;
  ladderPoint: number;
  queueSocket: string;
  gameSocket: string;
  gameId: string;

  static fromEntity(entity: User): UserModel {
    const { id, nickname } = entity;
    return new UserModel(id, nickname);
  }

  static fromRedis(redisUser: UserModel): UserModel {
    const user: UserModel = new UserModel(redisUser.id, redisUser.nickname);
    user.imgUrl = redisUser.imgUrl;
    user.title = redisUser.title;
    user.ladderPoint = redisUser.ladderPoint;
    user.queueSocket = redisUser.queueSocket;
    user.gameSocket = redisUser.gameSocket;
    user.gameId = redisUser.gameId;
    return user;
  }

  constructor(id: number, nickname: string) {
    this.id = id;
    this.nickname = nickname;
    this.imgUrl = null;
    this.title = null;
    this.ladderPoint = null;
    this.queueSocket = null;
    this.gameSocket = null;
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
