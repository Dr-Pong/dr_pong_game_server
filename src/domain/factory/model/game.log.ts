export type GameEvent = 'score' | 'touch'; // | 'emoji';

export class GameLog {
  userId: number;
  round: number;
  event: GameEvent;
  time: Date;

  constructor(userId: number, round: number, event: GameEvent) {
    this.userId = userId;
    this.round = round;
    this.event = event;
    this.time = new Date();
  }
}
