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
  beginSpeed: number; // 공의 초기 속도
  speed: number; // 공의 속도
  spinSpeed: number; // 공의 회전량 (-1 ~ 1). -1일 경우 반시계방향, 1일 경우 시계방향
  direction: Vector; // 공의 이동 방향
  elasticity: number; // 공의 탄성

  constructor(size: number, speed: number) {
    this.x = +process.env.BOARD_WIDTH / 2;
    this.y = +process.env.BOARD_HEIGHT / 2;
    this.size = size;
    this.beginSpeed = speed;
    this.speed = speed;
    this.spinSpeed = 0;
    this.direction = new Vector(0, 1);
    this.elasticity = 1.02;
  }

  reset(direction: number): void {
    this.x = +process.env.BOARD_WIDTH / 2;
    this.y = +process.env.BOARD_HEIGHT / 2;
    this.direction = new Vector(0, direction);
    this.direction = this.direction.normalize();
    this.spinSpeed = 0;
    this.speed = this.beginSpeed;
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
    if (this.x < this.size / 2) {
      this.setPosition(this.size / 2, this.y);
    }
    if (this.x > +process.env.BOARD_WIDTH - this.size / 2) {
      this.setPosition(+process.env.BOARD_WIDTH - this.size / 2, this.y);
    }
  }

  isTouchingBar(bar: Bar): boolean {
    const barLeft: number = bar.position - bar.width / 2;
    const barRight: number = bar.position + bar.width / 2;

    // 위쪽과 아래쪽을 체크
    if (bar.isReverse)
      return (
        this.y - this.size / 2 <= 1.5 / +process.env.BOARD_HEIGHT &&
        this.x + this.size >= barLeft &&
        this.x - this.size <= barRight
      );
    return (
      this.y + this.size / 2 >=
        +process.env.BOARD_HEIGHT - 1.5 / +process.env.BOARD_HEIGHT &&
      this.x + this.size >= barLeft &&
      this.x - this.size <= barRight
    );
  }

  touchBar(bar: Bar): void {
    this.direction.y *= -1;
    let barDirection = bar.direction;
    if (bar.isReverse)
      barDirection = barDirection === 'left' ? 'right' : 'left';
    if (barDirection === 'left') {
      this.spinSpeed =
        this.spinSpeed +
        ((bar.speed * bar.friction * bar.movedDistance) /
          +process.env.BOARD_WIDTH -
          this.spinSpeed) /
          +process.env.GAME_FRAME;
    }
    if (barDirection === 'right') {
      this.spinSpeed =
        this.spinSpeed -
        ((bar.speed * bar.friction * bar.movedDistance) /
          +process.env.BOARD_WIDTH -
          this.spinSpeed) /
          +process.env.GAME_FRAME;
    }
    this.speed *= this.elasticity * bar.elasticity;
    if (this.speed > +process.env.BALL_SPEED * 5)
      this.speed = +process.env.BALL_SPEED * 5;
    if (this.y > +process.env.BOARD_HEIGHT - this.size / 2) {
      this.setPosition(this.x, +process.env.BOARD_HEIGHT - this.size / 2);
    } else if (this.y < this.size / 2) {
      this.setPosition(this.x, this.size / 2);
    }
  }

  randomBounce(vector: number): void {
    this.direction.x = new Vector(vector, 1).normalize().x;
    this.direction.normalize();
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

  copy(): Ball {
    const ball = new Ball(this.size, this.speed);
    ball.x = this.x;
    ball.y = this.y;
    ball.direction = this.direction;
    ball.spinSpeed = this.spinSpeed;
    ball.elasticity = this.elasticity;
    return ball;
  }
}
