import { Ball } from './ball';

export class GameBoard {
  width: number;
  height: number;
  //   board: number[][];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  touchWall(ball: Ball): void {
    ball.vector.x = -ball.vector.x; // 회전에 따라 방향 추가 필요
  }
}
