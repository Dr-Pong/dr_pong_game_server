import { Socket } from 'socket.io';
import { Bar } from '../objects/bar';

export class GamePlayerModel {
  id: number;
  nickname: string;
  ladderPoint: number;
  score: number;
  bar: Bar;
  socket: Socket;
  isReady: boolean;

  constructor(id: number, nickname: string) {
    this.id = id;
    this.nickname = nickname;
    this.score = 0;
    this.bar = new Bar(
      +process.env.BAR_SPEED,
      +process.env.BAR_SIZE,
      +process.env.BOARD_WIDTH / 2,
    );
    this.isReady = false;
  }
}
