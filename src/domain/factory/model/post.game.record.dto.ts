import { eloChangeCulculator } from 'src/global/utils/util.elo';
import { GameModel } from './game.model';

export class PostGameRecordDto {
  player1: {
    id: number;
    score: number;
    lpChange: number;
  };
  player2: {
    id: number;
    score: number;
    lpChange: number;
  };
  mode: 'SFINAE' | 'NON-SFINAE';
  type: 'rank' | 'normal';
  startTime: Date;
  endTime: Date;
  logs: {
    userId: number;
    event: 'touch' | 'score';
    round: number;
    ball: {
      speed: number;
      direction: { x: number; y: number };
      position: { x: number; y: number };
      spinSpeed: number;
    };
  }[];

  constructor(game: GameModel) {
    const player1LpChange = eloChangeCulculator(
      game.player1.ladderPoint,
      game.player2.ladderPoint,
      game.player1.score > game.player2.score,
    );
    const player2LpChange = eloChangeCulculator(
      game.player2.ladderPoint,
      game.player1.ladderPoint,
      game.player2.score > game.player1.score,
    );

    this.player1 = {
      id: game.player1.id,
      score: game.player1.score,
      lpChange: player1LpChange,
    };
    this.player2 = {
      id: game.player2.id,
      score: game.player2.score,
      lpChange: player2LpChange,
    };
    this.mode = game.mode;
    this.type = game.type;
    this.startTime = game.startTime;
    this.endTime = game.endTime;
    this.logs = game.touchLog.map((log) => {
      return {
        userId: log.userId,
        event: log.event,
        round: log.round,
        ball: {
          speed: log.ball.speed,
          direction: log.ball.direction,
          position: { x: log.ball.x, y: log.ball.y },
          spinSpeed: log.ball.spinSpeed,
        },
      };
    });
  }
}
