import { randomInt } from 'crypto';

export type BarMode = 'normal' | 'special';
export type BarDirection = 'left' | 'right' | 'stop';

export class Bar {
  speed: number;
  direction: 'left' | 'right' | 'stop';
  width: number;
  position: number;
  movedDistance: number;
  mode: BarMode;
  // 탄성계수
  elasticity: number;
  // 마찰계수
  friction: number;
  isReverse: boolean;

  constructor(
    speed: number,
    width: number,
    position: number,
    isReverse: boolean,
  ) {
    this.speed = speed;
    this.width = width;
    this.position = position;
    this.movedDistance = 0;
    this.direction = 'stop';
    this.mode = 'normal';
    this.elasticity = 1;
    this.friction = randomInt(60, 100) / 30; // 0.5 ~ 1.5
    this.isReverse = isReverse;
  }

  reset(): void {
    this.direction = 'stop'; // 실제 쓸거
    this.movedDistance = 0;
    this.position = +process.env.BOARD_WIDTH / 2;
  }

  move(): void {
    // 벽 충돌 처리
    if (this.direction === 'left') {
      this.moveLeft();
    } else if (this.direction === 'right') {
      this.moveRight();
    }
  }

  stop(): void {
    this.direction = 'stop';
    this.movedDistance = 0;
  }

  moveLeft(): void {
    this.position -= this.speed / +process.env.GAME_FRAME;
    this.movedDistance += this.speed / +process.env.GAME_FRAME;
    if (this.position <= this.width / 2) {
      this.stop();
      this.position = this.width / 2;
      return;
    }
  }

  moveRight(): void {
    this.position += this.speed / +process.env.GAME_FRAME;
    this.movedDistance += this.speed / +process.env.GAME_FRAME;
    if (this.position >= +process.env.BOARD_WIDTH - this.width / 2) {
      this.stop();
      this.position = +process.env.BOARD_WIDTH - this.width / 2;
      return;
    }
  }

  copy(): Bar {
    const bar: Bar = new Bar(
      this.speed,
      this.width,
      this.position,
      this.isReverse,
    );
    bar.direction = this.direction;
    bar.movedDistance = this.movedDistance;
    bar.mode = this.mode;
    return bar;
  }
}
