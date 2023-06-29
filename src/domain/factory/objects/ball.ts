import { Bar } from './bar';

export interface Vector {
  x: number;
  y: number;
}

export class Ball {
  x: number; // 공의 x좌표
  y: number; // 공의 y좌표
  size: number; // 공의 반지름
  speed: number; // 공의 속도
  spinSpeed: number; // 공의 회전량 (-1 ~ 1). -1일 경우 반시계방향, 1일 경우 시계방향
  vector: Vector; // 공의 이동 방향
  elasticity: number; // 공의 탄성

  constructor(size: number, speed: number) {
    this.x = +process.env.BOARD_WIDTH / 2;
    this.y = +process.env.BOARD_HEIGHT / 2;
    this.size = size;
    this.speed = speed;
    this.spinSpeed = 0;
    this.vector = { x: 0, y: -1 };
    this.elasticity = 1;
  }

  reset(direction: number): void {
    this.x = +process.env.BOARD_WIDTH / 2;
    this.y = +process.env.BOARD_HEIGHT / 2;
    this.vector = { x: 0, y: direction };
  }

  move(): void {
    this.x += this.vector.x * this.speed;
    this.y += this.vector.y * this.speed;
  }

  touchWall(): void {
    this.vector.x *= -1; // 회전수 보정 필요
  }

  touchBar(bar: Bar): void {
    this.vector.y *= -1;
    console.log(bar);
    // this.spin = (this.x - bar.position) / bar.width;
  }

  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }
}
