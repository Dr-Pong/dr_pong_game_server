export interface Vector {
  x: number;
  y: number;
}

export class Ball {
  x: number; // 공의 x좌표
  y: number; // 공의 y좌표
  size: number; // 공의 반지름
  speed: number; // 공의 속도
  spin: number; // 공의 회전량 (-1 ~ 1). -1일 경우 반시계방향, 1일 경우 시계방향
  vector: Vector; // 공의 이동 방향
  elasticity: number; // 공의 탄성

  constructor(size: number, speed: number) {
    this.x = process.env.BOARD_WIDTH / 2;
    this.y = process.env.BOARD_HEIGHT / 2;
    this.size = size;
    this.speed = speed;
    this.spin = 0;
    this.vector = { x: 0, y: -1 };
    this.elasticity = 1;
  }

  move(): void {
    this.x += this.vector.x * this.speed;
    this.y += this.vector.y * this.speed;
  }
}
