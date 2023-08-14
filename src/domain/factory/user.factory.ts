import { BadRequestException, Injectable } from '@nestjs/common';
import { UserModel } from './model/user.model';
import { Socket } from 'socket.io';
import axios from 'axios';

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
    // user.socket[gatewayType] = socket;
  }

  setGameId(userId: number, gameId: string): void {
    const user: UserModel = this.findById(userId);
    user.gameId = gameId;
  }

  async setLadderPoint(userId: number): Promise<void> {
    const user: UserModel = this.findById(userId);
    const ladderPoint: number = await this.getUserLadderPointFromWebServer(
      userId,
    );
    user.ladderPoint = ladderPoint;
  }

  async setUserInfo(userId: number): Promise<void> {
    const user: UserModel = this.findById(userId);
    const userInfo = await this.getUserInfoFromWebServer(user.nickname);
    user.imgUrl = userInfo?.imgUrl;
    user.title = userInfo?.title;
  }

  deleteGameId(userId: number): void {
    const user: UserModel = this.findById(userId);
    user.gameId = null;
    // user.socket['game'] = null;
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
        imgUrl: response.data?.image.url,
        title: response.data?.title?.title ?? null,
      };
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
