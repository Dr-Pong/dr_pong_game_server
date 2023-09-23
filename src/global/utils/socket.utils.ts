import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { Socket } from 'socket.io';
import { GameModel } from 'src/domain/factory/model/game.model';
import { UserModel } from 'src/domain/factory/model/user.model';
import { GameResultDto } from 'src/domain/game/dto/game.reulst.dto';
import { PostGameRecordDto } from 'src/domain/game/dto/post.game.record.dto';
import * as dotenv from 'dotenv';
import { RedisUserRepository } from 'src/domain/redis/redis.user.repository';

dotenv.config();

export async function getUserFromSocket(
  socket: Socket,
  redisUserRepository: RedisUserRepository,
): Promise<UserModel | null> {
  const jwtService: JwtService = new JwtService({
    secret: process.env.JWT_SECRET,
    signOptions: {
      expiresIn: +process.env.JWT_EXPIRATION_TIME,
    },
  });

  const accesstoken = socket.handshake.auth?.Authorization?.split(' ')[1];
  if (!accesstoken) {
    return null;
  }
  try {
    const userToken = jwtService.verify(accesstoken);
    const userId = userToken?.id;
    const user: UserModel = await redisUserRepository.findById(userId);
    return user;
  } catch (e) {
    return null;
  }
}

export async function checkAchievementAndTitle(game: GameModel): Promise<void> {
  let result: GameResultDto;
  try {
    result = (
      await axios.post(
        `${process.env.WEBSERVER_URL}/games`,
        new PostGameRecordDto(game),
      )
    ).data;
    for (const title of result?.title) {
      if (title.userId === game.player1.id) {
        game.player1.socket?.emit('title', { title: title.title });
      }
      if (title.userId === game.player2.id) {
        game.player2.socket?.emit('title', { title: title.title });
      }
    }
    for (const achievement of result?.achievement) {
      if (achievement.userId === game.player1.id) {
        game.player1.socket?.emit('achievement', {
          name: achievement.achievement,
          imgUrl: achievement.imgUrl,
        });
      }
      if (achievement.userId === game.player2.id) {
        game.player2.socket?.emit('achievement', {
          achievement: achievement.achievement,
          imgUrl: achievement.imgUrl,
        });
      }
    }
  } catch (e) {
    console.log(e?.response?.data);
  }
}

export async function patchUserStatesOutOfGame(game: GameModel): Promise<void> {
  try {
    await axios.patch(`${process.env.CHATSERVER_URL}/users/state`, {
      userId: game.player1.id,
      gameId: null,
      type: null,
      mode: null,
    });
    await axios.patch(`${process.env.CHATSERVER_URL}/users/state`, {
      userId: game.player2.id,
      gameId: null,
      type: null,
      mode: null,
    });
  } catch (e) {
    console.log(e?.response?.data);
  }
}

export async function patchUserStatesInGame(
  game: GameModel,
  user: UserModel,
): Promise<void> {
  try {
    await axios.patch(`${process.env.CHATSERVER_URL}/users/state`, {
      userId: user.id,
      gameId: game?.id,
      type: game?.type,
      mode: game?.mode,
    });
  } catch (e) {
    console.log(e?.response?.data);
  }
}
