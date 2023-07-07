import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
} from '@nestjs/websockets';
import { UserFactory } from '../factory/user.factory';
import { QueueFactory } from '../factory/queue.factory';
import { Socket } from 'socket.io';
import { UserModel } from '../factory/model/user.model';
import { getUserFromSocket } from '../game/game.gateway';

@WebSocketGateway({ namespace: '/' })
export class QueueGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly queueFactory: QueueFactory,
    private readonly userFactory: UserFactory,
  ) {}
  sockets: Map<string, number> = new Map();

  async handleConnection(@ConnectedSocket() socket: Socket) {
    const user: UserModel = getUserFromSocket(socket, this.userFactory);
    if (!user) {
      socket.disconnect();
      return;
    }

    if (user.socket?.id !== socket.id) {
      user.socket?.disconnect();
    }
    this.userFactory.setSocket(user.id, socket);
    this.sockets.set(socket.id, user.id);
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    const userId: number = this.sockets.get(socket.id);
    this.userFactory.setSocket(userId, null);
    this.sockets.delete(socket.id);
  }

  async sendJoinGame(userId: number): Promise<void> {
    const user: UserModel = this.userFactory.findById(userId);
    user.socket?.emit('joinGame', { roomId: user.gameId });
  }
}
