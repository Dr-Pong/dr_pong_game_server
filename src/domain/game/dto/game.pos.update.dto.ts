import { GameModel } from 'src/domain/factory/model/game.model';
import * as dotenv from 'dotenv';
import { Ball } from 'src/domain/factory/objects/ball';
import { Bar } from 'src/domain/factory/objects/bar';
import { GAMEMODE_RANDOMBOUNCE } from 'src/global/type/type.game.mode';

dotenv.config();

class GamePosDto {
  ballPos: { x: number; y: number };
  playerXPos: {
    me: number;
    opponent: number;
  };
  gameTime: number;
  frame: number;

  constructor(
    ballPos: { x: number; y: number },
    playerXPos: {
      me: number;
      opponent: number;
    },
    gameTime: number,
    frame: number,
  ) {
    this.ballPos = ballPos;
    this.playerXPos = playerXPos;
    this.gameTime = gameTime;
    this.frame = frame;
  }
}

export class GamePosUpdateDto {
  data: GamePosDto[] = [];

  constructor(game: GameModel, userId: number) {
    const tempBall: Ball = game.ball.copy();
    const tempPlayer1Bar: Bar = game.player1.bar.copy();
    const tempPlayer2Bar: Bar = game.player2.bar.copy();

    for (let i = 0; i < 10; i++) {
      const gameTime =
        +process.env.GAME_TIME -
        (game.playTime + (i * 1000) / +process.env.GAME_FRAME);
      if (game.player1.id === userId) {
        const ballPos = {
          x: tempBall.x / game.board.width,
          y: tempBall.y / game.board.height,
        };
        const playerXPos = {
          me: tempPlayer1Bar.position / game.board.width,
          opponent: tempPlayer2Bar.position / game.board.width,
        };
        this.data.push(
          new GamePosDto(ballPos, playerXPos, gameTime, game.frame + i),
        );
      } else {
        const ballPos = {
          x: (game.board.width - tempBall.x) / game.board.width,
          y: (game.board.height - tempBall.y) / game.board.height,
        };
        const playerXPos = {
          me: (game.board.width - tempPlayer2Bar.position) / game.board.width,
          opponent:
            (game.board.width - tempPlayer1Bar.position) / game.board.width,
        };
        this.data.push(
          new GamePosDto(ballPos, playerXPos, gameTime, game.frame + i),
        );
      }
      tempBall.move();
      tempPlayer1Bar.move();
      tempPlayer2Bar.move();
      if (tempBall.x - tempBall.size / 2 <= 0) tempBall.touchWall();
      if (tempBall.x + tempBall.size / 2 >= game.board.width)
        tempBall.touchWall();
      if (tempBall.isTouchingBar(tempPlayer1Bar)) {
        if (game.mode === GAMEMODE_RANDOMBOUNCE)
          tempBall.randomBounce(game.randomSeed[game.seedIndex + i]);
        tempBall.touchBar(tempPlayer1Bar);
      }
      if (tempBall.isTouchingBar(tempPlayer2Bar)) {
        if (game.mode === GAMEMODE_RANDOMBOUNCE)
          tempBall.randomBounce(game.randomSeed[game.seedIndex + i]);
        tempBall.touchBar(tempPlayer2Bar);
      }
    }
  }
}
