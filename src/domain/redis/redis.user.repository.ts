import { BadRequestException, Injectable } from '@nestjs/common';
import { UserModel } from '../factory/model/user.model';
import { Socket } from 'socket.io';
import axios from 'axios';
import { KeyManager } from './util/redis.key.manager';
import { InjectRedis, Redis } from '@nestjs-modules/ioredis';

@Injectable()
export class RedisUserRepository {
  constructor(
    @InjectRedis()
    private readonly redis: Redis,
  ) {}

  async findById(userId: number): Promise<UserModel> {
    const user: UserModel = JSON.parse(
      await this.redis.get(KeyManager.generateUserIdKey(userId)),
    );
    return user;
  }

  async findByNickname(nickname: string): Promise<UserModel> {
    const userId = Number(
      await this.redis.get(KeyManager.generateUserNickNameKey(nickname)),
    );
    return await this.findById(userId);
  }

  async create(user: UserModel): Promise<UserModel> {
    await this.redis.set(user.getRedisKeyId(), user.toString());
    await this.redis.set(user.getRedisKeyNickname(), user.id.toString());
    return user;
  }

  async setSocket(
    userId: number,
    gatewayType: string,
    socket: Socket,
  ): Promise<void> {
    const user: UserModel = await this.findById(userId);
    user.socket[gatewayType] = socket;
    await this.redis.set(user.getRedisKeyId(), user.toString());
  }

  async setGameId(userId: number, gameId: string): Promise<void> {
    const user: UserModel = await this.findById(userId);
    user.gameId = gameId;
    await this.redis.set(user.getRedisKeyId(), user.toString());
  }

  async setLadderPoint(userId: number): Promise<void> {
    const user: UserModel = await this.findById(userId);
    const ladderPoint: number = await this.getUserLadderPointFromWebServer(
      userId,
    );
    user.ladderPoint = ladderPoint;
    await this.redis.set(user.getRedisKeyId(), user.toString());
  }

  async setUserInfo(userId: number): Promise<void> {
    const user: UserModel = await this.findById(userId);
    const userInfo = await this.getUserInfoFromWebServer(user.nickname);
    user.imgUrl = userInfo?.imgUrl;
    user.title = userInfo?.title;
    await this.redis.set(user.getRedisKeyId(), user.toString());
  }

  async deleteGameId(userId: number): Promise<void> {
    const user: UserModel = await this.findById(userId);
    user.gameId = null;
    user.socket['game'] = null;
    await this.redis.set(user.getRedisKeyId(), user.toString());
  }

  private async getUserLadderPointFromWebServer(
    userId: number,
  ): Promise<number> {
    try {
      const response = await axios.get(
        process.env.WEBSERVER_URL + '/users/' + userId + '/ranks/current',
      );
      return response.data.lp;
    } catch (error) {
      throw new BadRequestException('Error getting rank');
    }
  }

  private async getUserInfoFromWebServer(
    nickname: string,
  ): Promise<{ imgUrl: string; title: string }> {
    try {
      const response = await axios.get(
        process.env.WEBSERVER_URL + '/users/' + nickname + '/detail',
      );
      return {
        imgUrl: response.data.image.url,
        title: response.data.title.title,
      };
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
