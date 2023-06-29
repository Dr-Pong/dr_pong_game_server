import { Bar } from '../objects/bar';

export class GamePlayerModel {
  id: number;
  nickname: string;
  score: number;
  bar: Bar;

  constructor(id: number, nickname: string) {
    this.id = id;
    this.nickname = nickname;
    this.score = 0;
    this.bar = new Bar(10, 100, 0);
  }
}
