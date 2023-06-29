export type BarMode = 'normal' | 'special';
export type BarDirection = 'left' | 'right' | 'stop';

export class Bar {
  speed: number;
  direction: 'left' | 'right' | 'stop';
  width: number;
  position: number;
  mode: BarMode;

  constructor(speed: number, width: number, position: number) {
    this.speed = speed;
    this.width = width;
    this.position = position;
  }

  reset(): void {
    this.direction = 'stop';
  }

  move(): void {
    if (this.direction === 'left') {
      this.moveLeft();
    } else if (this.direction === 'right') {
      this.moveRight();
    }
  }

  moveLeft(): void {
    this.position -= this.speed;
  }

  moveRight(): void {
    this.position += this.speed;
  }
}
