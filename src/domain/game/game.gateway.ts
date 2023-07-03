import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
} from '@nestjs/websockets';
import { GameFactory } from '../factory/game.factory';
import { UserFactory } from '../factory/user.factory';
import { Socket } from 'socket.io';
import { UserModel } from '../factory/model/user.model';
import { JwtService } from '@nestjs/jwt';
import { GameModel } from '../factory/model/game.model';
import { GATEWAY_GAME } from 'src/global/type/type.gateway';

@WebSocketGateway({ namespace: 'game' })
export class GameGateWay implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly gameFactory: GameFactory,
    private readonly userFactory: UserFactory,
  ) {}
  sockets: Map<string, number> = new Map();

  handleConnection(@ConnectedSocket() socket: Socket) {
    const user: UserModel = getUserFromSocket(socket, this.userFactory);
    if (!user) {
      return;
    }
    this.userFactory.setSocket(user.id, GATEWAY_GAME, socket);
    this.sockets.set(socket.id, user.id);

    this.gameFactory.setUserIsReady(user.id, user.gameId, true);
    const game: GameModel = this.gameFactory.findById(user.gameId);
    if (game.player1.isReady && game.player2.isReady) {
      game.start();
    }
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    const userId: number = this.sockets.get(socket.id);
    this.userFactory.setSocket(userId, GATEWAY_GAME, null);
    this.sockets.delete(socket.id);
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
