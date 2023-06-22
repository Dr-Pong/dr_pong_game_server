import { Injectable } from '@nestjs/common';

@Injectable()
export class QueueFactory {
  private ladderQueue: Map<number, number> = new Map();

  addLadderQueue(userId: number): void {
    this.ladderQueue.set(userId, userId);
  }

  get(userId: number): number {
    return this.ladderQueue.get(userId);
  }

  delete(userId: number): void {
    this.ladderQueue.delete(userId);
  }
}
