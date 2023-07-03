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
import axios from 'axios';
import {
  USERSTATUS_IN_GAME,
  USERSTATUS_NOT_IN_GAME,
} from 'src/global/type/type.user.status';

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
      socket.disconnect();
      return;
    }
    this.userFactory.setStatus(user.id, USERSTATUS_IN_GAME);
    this.sockets.set(socket.id, user.id);

    try {
      await axios.patch(`${process.env.CHAT_URL}/users/state`, {
        user1Id: user.id,
        state: USERSTATUS_IN_GAME,
      });
    } catch (e) {
      socket.disconnect();
      console.log(e);
      return;
    }
    this.gameFactory.setUserIsReady(user.id, user.gameId, true);
    const game: GameModel = this.gameFactory.findById(user.gameId);
    if (game.player1.id === user.id) {
      game.player1.socket = socket;
    } else {
      game.player2.socket = socket;
    }
    if (game.player1.isReady && game.player2.isReady) {
      game.start();
    }
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    const user: UserModel = this.userFactory.findById(
      this.sockets.get(socket.id),
    );
    this.userFactory.setStatus(user.id, USERSTATUS_NOT_IN_GAME);
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
