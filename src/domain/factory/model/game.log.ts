import { Ball } from '../objects/ball';

export type GameEvent = 'score' | 'touch'; // | 'emoji';

export class GameLog {
  userId: number;
  round: number;
  event: GameEvent;
  time: Date;
  ball: Ball;

  constructor(userId: number, round: number, event: GameEvent, ball: Ball) {
    this.userId = userId;
    this.round = round;
    this.event = event;
    this.time = new Date();
    this.ball = ball.saveLog();
  }
}
