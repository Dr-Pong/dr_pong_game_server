import { randomInt } from 'crypto';
import { Bar } from './bar';

export class Vector {
  x: number;
  y: number;

  // 회전 함수
  rotate(angle: number): Vector {
    const cosAngle = Math.cos(angle);
    const sinAngle = Math.sin(angle);

    const rotatedX = this.x * cosAngle - this.y * sinAngle;
    const rotatedY = this.x * sinAngle + this.y * cosAngle;

    return new Vector(rotatedX, rotatedY);
  }

  // 정규화 함수
  normalize(): Vector {
    const length = Math.sqrt(this.x * this.x + this.y * this.y);
    if (length === 0 || this.y === 0) return new Vector(0, 1);
    return new Vector(this.x / length, this.y / length);
  }

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

export class Ball {
  x: number; // 공의 x좌표
  y: number; // 공의 y좌표
  size: number; // 공의 반지름
  speed: number; // 공의 속도
  spinSpeed: number; // 공의 회전량 (-1 ~ 1). -1일 경우 반시계방향, 1일 경우 시계방향
  direction: Vector; // 공의 이동 방향
  elasticity: number; // 공의 탄성

  constructor(size: number, speed: number) {
    this.x = +process.env.BOARD_WIDTH / 2;
    this.y = +process.env.BOARD_HEIGHT / 2;
    this.size = size;
    this.speed = speed;
    this.spinSpeed = 0;
    this.direction = new Vector(0, 1);
    this.elasticity = 1;
  }

  reset(direction: number): void {
    this.x = +process.env.BOARD_WIDTH / 2;
    this.y = +process.env.BOARD_HEIGHT / 2;
    this.direction = new Vector(-randomInt(0, 5), direction * randomInt(5, 10));
    this.direction = this.direction.normalize();
    this.spinSpeed = 0;
  }

  move(): void {
    /**
     * 회전이 풀어지게 하는 코드
     * if (this.spinSpeed > 0) this.spinSpeed -= 1 / +process.env.GAME_FRAME;
     * if (this.spinSpeed < 0) this.spinSpeed += 1 / +process.env.GAME_FRAME;
     * */

    // 프레임에 따른 회전량 적용
    this.direction = this.direction.rotate(
      this.spinSpeed / +process.env.GAME_FRAME,
    );
    this.x += (this.direction.x * this.speed) / +process.env.GAME_FRAME;
    this.y += (this.direction.y * this.speed) / +process.env.GAME_FRAME;
  }

  touchWall(): void {
    this.direction.x *= -1;
    this.spinSpeed *= this.elasticity;
    // process.stdout.write('\u0007');
  }

  touchBar(bar: Bar): void {
    this.direction.y *= -1;
    // process.stdout.write('\u0007');
    if (bar.direction === 'left') {
      this.spinSpeed =
        this.spinSpeed +
        (bar.speed * bar.friction - this.spinSpeed) / +process.env.GAME_FRAME;
    }
    if (bar.direction === 'right') {
      this.spinSpeed =
        this.spinSpeed -
        (bar.speed * bar.friction - this.spinSpeed) / +process.env.GAME_FRAME;
    }
    this.speed *= this.elasticity * bar.elasticity;
  }

  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  saveLog(): Ball {
    const ball = new Ball(this.size, this.speed);
    ball.x = this.x;
    ball.y = this.y;
    ball.direction = this.direction;
    ball.spinSpeed = this.spinSpeed;
    ball.elasticity = this.elasticity;
    return ball;
  }
}
