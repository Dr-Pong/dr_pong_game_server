import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { GameFactory } from '../factory/game.factory';
import { UserFactory } from '../factory/user.factory';
import { Socket } from 'socket.io';
import { UserModel } from '../factory/model/user.model';
import { JwtService } from '@nestjs/jwt';
import { GameModel } from '../factory/model/game.model';
import axios from 'axios';
import {
  USERSTATUS_IN_GAME,
  USERSTATUS_NOT_IN_GAME,
} from 'src/global/type/type.user.status';
import { GamePlayerModel } from '../factory/model/game-player.model';
import { GameInitDto } from './dto/game.init.dto';

@WebSocketGateway({ namespace: 'game' })
export class GameGateWay implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly gameFactory: GameFactory,
    private readonly userFactory: UserFactory,
  ) {}
  sockets: Map<string, number> = new Map();

  async handleConnection(@ConnectedSocket() socket: Socket) {
    const user: UserModel = getUserFromSocket(socket, this.userFactory);
    if (!user) {
      console.log('user not found', socket.id);
      socket.disconnect();
      return;
    }
    this.setUserInFactory(user, socket);
    this.setUserInGame(user, socket);
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    const user: UserModel = this.userFactory.findById(
      this.sockets.get(socket.id),
    );
    this.userFactory.setStatus(user.id, USERSTATUS_NOT_IN_GAME);
    this.sockets.delete(socket.id);
  }

  @SubscribeMessage('keyPress')
  async handleKeyPress(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomId: string; key: 'left' | 'right' },
  ): Promise<void> {
    const userId: number = this.sockets.get(socket.id);
    if (!userId) {
      socket.disconnect();
      return;
    }
    const game: GameModel = this.gameFactory.findById(data.roomId);
    if (!game) {
      socket.disconnect();
      return;
    }
    this.gameFactory.handelKeyPress(game.id, userId, data.key);
  }

  @SubscribeMessage('keyRelease')
  async handleKeyRelease(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomId: string; key: 'left' | 'right' },
  ): Promise<void> {
    const userId: number = this.sockets.get(socket.id);
    if (!userId) {
      socket.disconnect();
      return;
    }
    const game: GameModel = this.gameFactory.findById(data.roomId);
    if (!game) {
      socket.disconnect();
      return;
    }
    this.gameFactory.handelKeyRelease(game.id, userId, data.key);
  }

  @SubscribeMessage('myEmoji')
  handleMyEmoji(
    @ConnectedSocket() socket: Socket,
    data: { url: string },
  ): void {
    const userId: number = this.sockets.get(socket.id);
    if (!userId) {
      socket.disconnect();
      return;
    }
    const game: GameModel = this.gameFactory.findById(
      this.userFactory.findById(userId).gameId,
    );
    if (!game) {
      socket.disconnect();
      return;
    }
    if (game.player1.id === userId) {
      game.player2.socket?.emit('opponentEmoji', { url: data.url });
    }
    if (game.player2.id === userId) {
      game.player1.socket?.emit('opponentEmoji', { url: data.url });
    }
  }

  private async setUserInFactory(
    user: UserModel,
    socket: Socket,
  ): Promise<void> {
    console.log('user connected', user.id, user.nickname);
    if (user.socket?.id !== socket.id) {
      user.socket?.disconnect();
    }
    this.sockets.set(socket.id, user.id);
    this.userFactory.setStatus(user.id, USERSTATUS_IN_GAME);

    try {
      await axios.patch(`${process.env.CHAT_URL}/users/state`, {
        user1Id: user.id,
        state: USERSTATUS_IN_GAME,
      });
    } catch (e) {
      console.log(e?.response?.data);
    }
    this.gameFactory.setUserIsReady(user.id, user.gameId, true);
  }

  private async setUserInGame(user: UserModel, socket: Socket) {
    const game: GameModel = this.gameFactory.findById(user.gameId);
    if (!game) {
      socket.disconnect();
      return;
    }
    if (game.player1.id === user.id) {
      game.player1.socket = socket;
    } else {
      game.player2.socket = socket;
    }
    this.sendGameInfo(user, game);
    await this.gameFactory.start(game.id);
  }

  private async sendGameInfo(user: UserModel, game: GameModel): Promise<void> {
    const gamePlayer: GamePlayerModel =
      game.player1.id === user.id ? game.player1 : game.player2;
    const opponent: GamePlayerModel =
      game.player1.id === user.id ? game.player2 : game.player1;

    gamePlayer.socket?.emit('matchInfo', {
      nickname: opponent.nickname,
    });
    gamePlayer.socket?.emit('initData', new GameInitDto(game, user));
  }
}

export function getUserFromSocket(
  socket: Socket,
  userFactory: UserFactory,
): UserModel {
  const jwtService: JwtService = new JwtService({
    secret: 'jwtSecret',
    signOptions: {
      expiresIn: 60 * 60 * 60,
    },
  });

  const accesstoken = socket.handshake.auth?.Authorization?.split(' ')[1];
  if (!accesstoken) {
    console.log('no token', socket.id);
    return null;
  }
  try {
    const userToken = jwtService.verify(accesstoken);
    const userId = userToken?.id;
    const user: UserModel = userFactory.findById(userId);
    return user;
  } catch (e) {
    console.log(accesstoken, e);
    return null;
  }
}
