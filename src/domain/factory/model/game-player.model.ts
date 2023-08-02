import { Socket } from 'socket.io';
import { Bar } from '../objects/bar';
import { UserModel } from './user.model';

export class GamePlayerModel {
  id: number;
  nickname: string;
  imgUrl: string;
  title: string;
  ladderPoint: number;
  score: number;
  bar: Bar;
  socket: Socket;
  isReady: boolean;

  constructor(user: UserModel) {
    this.id = user.id;
    this.nickname = user.nickname;
    this.imgUrl = user.imgUrl;
    this.title = user.title;
    this.ladderPoint = user.ladderPoint;
    this.score = 0;
    this.bar = new Bar(
      +process.env.BAR_SPEED,
      +process.env.BAR_WIDTH,
      +process.env.BOARD_WIDTH / 2,
    );
    this.isReady = false;
  }
}
