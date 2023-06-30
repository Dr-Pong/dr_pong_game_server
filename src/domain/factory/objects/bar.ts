import { Ball } from './ball';

export type BarMode = 'normal' | 'special';

export class Bar {
  speed: number;
  width: number;
  position: number;
  mode: BarMode;

  constructor(speed: number, width: number, position: number) {
    this.speed = speed;
    this.width = width;
    this.position = position;
  }

  moveLeft(): void {
    this.position -= this.speed;
  }

  moveRight(): void {
    this.position += this.speed;
  }

  touch(ball: Ball): void {
    if (this.mode === 'normal') {
      ball.vector.y = -ball.vector.y; // 회전량에 따라 반사각이 달라지는거 추가하기
    }
    if (this.mode === 'special') {
      //   ball.vector.x = -ball.vector.x;
    }
  }
}
