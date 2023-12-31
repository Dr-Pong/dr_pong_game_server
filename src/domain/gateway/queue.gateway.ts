import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { QueueFactory } from '../factory/queue.factory';
import { Server, Socket } from 'socket.io';
import { UserModel } from '../factory/model/user.model';
import { Mutex } from 'async-mutex';
import { getUserFromSocket } from 'src/global/utils/socket.utils';
import { RedisUserRepository } from '../redis/redis.user.repository';
import { MutexManager } from '../mutex/mutex.manager';

@WebSocketGateway({ namespace: '/' })
export class QueueGateWay implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly mutexManager: MutexManager,
    private readonly queueFactory: QueueFactory,
    private readonly redisUserRepository: RedisUserRepository,
  ) {}
  @WebSocketServer()
  server: Server;

  async handleConnection(@ConnectedSocket() socket: Socket) {
    const mutex: Mutex = this.mutexManager.getMutex('queueSocket');
    const release = await mutex.acquire();
    try {
      const user: UserModel = await getUserFromSocket(
        socket,
        this.redisUserRepository,
      );
      if (!user) {
        socket.disconnect();
        release();
        return;
      }

      if (user.queueSocket && user.queueSocket !== socket.id) {
        this.server.in(user.queueSocket).disconnectSockets(true);
        release();
        return;
      }
      await this.redisUserRepository.setSocket(user.id, 'queue', socket);
    } finally {
      release();
    }
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    const user: UserModel = await getUserFromSocket(
      socket,
      this.redisUserRepository,
    );
    if (!user) {
      socket.disconnect();
      return;
    }
    this.queueFactory.delete(user.id);
    await this.redisUserRepository.setSocket(user.id, 'queue', null);
  }

  async sendJoinGame(userId: number): Promise<void> {
    const user: UserModel = await this.redisUserRepository.findById(userId);
    this.server.to(user.queueSocket)?.emit('matched', { roomId: user.gameId });
  }
}
