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
import { Mutex } from 'async-mutex';
import { getUserFromSocket } from 'src/global/utils/socket.utils';

@WebSocketGateway({ namespace: '/' })
export class QueueGateWay implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly queueFactory: QueueFactory,
    private readonly userFactory: UserFactory,
  ) {}
  private mutex: Mutex = new Mutex();
  sockets: Map<string, number> = new Map();

  async handleConnection(@ConnectedSocket() socket: Socket) {
    const release = await this.mutex.acquire();
    try {
      const user: UserModel = getUserFromSocket(socket, this.userFactory);
      if (!user) {
        socket.disconnect();
        return;
      }
      console.log('join queue', user.nickname);

      if (user.socket['queue']?.id !== socket.id) {
        user.socket['queue']?.disconnect();
      }
      this.userFactory.setSocket(user.id, 'queue', socket);
      this.sockets.set(socket.id, user.id);
    } finally {
      release();
    }
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    const userId: number = this.sockets.get(socket.id);
    this.queueFactory.delete(userId);
    this.userFactory.setSocket(userId, 'queue', null);
    this.sockets.delete(socket.id);
  }

  async sendJoinGame(userId: number): Promise<void> {
    const user: UserModel = this.userFactory.findById(userId);
    user.socket['queue']?.emit('matched', { roomId: user.gameId });
  }
}
