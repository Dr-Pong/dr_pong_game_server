import { randomInt } from 'crypto';

export type BarMode = 'normal' | 'special';
export type BarDirection = 'left' | 'right' | 'stop';

export class Bar {
  speed: number;
  direction: 'left' | 'right' | 'stop';
  width: number;
  position: number;
  mode: BarMode;
  // 탄성계수
  elasticity: number;
  // 마찰계수
  friction: number;

  constructor(speed: number, width: number, position: number) {
    this.speed = speed;
    this.width = width;
    this.position = position;
    this.direction = 'stop';
    this.mode = 'normal';
    this.elasticity = 1;
    this.friction = randomInt(20, 50) / 10; // 0.5 ~ 1.5
  }

  reset(): void {
    this.direction = 'stop'; // 실제 쓸거
    this.position = +process.env.BOARD_WIDTH / 2;
  }

  move(): void {
    // 벽 충돌 처리
    if (this.position <= this.width / 2 && this.direction === 'left') {
      this.direction = 'stop';
      return;
    }
    if (
      this.position >= +process.env.BOARD_WIDTH - this.width / 2 &&
      this.direction === 'right'
    ) {
      this.direction = 'stop';
      return;
    }

    if (this.direction === 'left') {
      this.moveLeft();
    } else if (this.direction === 'right') {
      this.moveRight();
    }
  }

  moveLeft(): void {
    this.position -= this.speed / +process.env.GAME_FRAME;
  }

  moveRight(): void {
    this.position += this.speed / +process.env.GAME_FRAME;
  }
}
