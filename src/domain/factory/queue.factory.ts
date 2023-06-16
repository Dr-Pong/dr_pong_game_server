import { Injectable } from '@nestjs/common';
import { UserModel } from './model/user.model';

@Injectable()
export class QueueFactory {
  queue: UserModel[] = [];

  addUserToQueue(user: UserModel): void {
    this.queue.push(user);
    this.matchPlayers();
  }

  matchPlayers() {
    let currentIndex = 0;

    while (currentIndex < this.queue.length - 1) {
      const currentPlayer = this.queue[currentIndex];

      for (let i = currentIndex + 1; i < this.queue.length; i++) {
        const opponentPlayer = this.queue[i];

        const pointDifference = Math.abs(
          currentPlayer.ladderPoint - opponentPlayer.ladderPoint,
        );

        if (pointDifference <= 100) {
          currentPlayer.socket.emit('match', {
            id: opponentPlayer.id,
            nickname: opponentPlayer.nickname,
            ladderPoint: opponentPlayer.ladderPoint,
          });
          opponentPlayer.socket.emit('match', {
            id: currentPlayer.id,
            nickname: currentPlayer.nickname,
            ladderPoint: currentPlayer.ladderPoint,
          });

          this.removeUserFromQueue(currentPlayer);
          this.removeUserFromQueue(opponentPlayer);

          currentIndex--;
          break;
        }
      }

      currentIndex++;
    }
  }

  removeUserFromQueue(user: UserModel): void {
    const index: number = this.queue.findIndex((u) => u.id === user.id);
    this.queue.splice(index, 1);
  }
}
