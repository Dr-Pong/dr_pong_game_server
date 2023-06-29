import { Socket } from 'socket.io';
import { Bar } from '../objects/bar';

export class GamePlayerModel {
  id: number;
  nickname: string;
  ladderPoint: number;
  score: number;
  bar: Bar;
  socket: Socket;

  constructor(id: number, nickname: string) {
    this.id = id;
    this.nickname = nickname;
    this.score = 0;
    this.bar = new Bar(10, 100, 0);
  }
}
