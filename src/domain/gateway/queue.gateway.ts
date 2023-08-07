import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
} from '@nestjs/websockets';
import { QueueFactory } from '../factory/queue.factory';
import { Socket } from 'socket.io';
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

  async handleConnection(@ConnectedSocket() socket: Socket) {
    const mutex: Mutex = this.mutexManager.getMutex('queueSocket');
    const release = await mutex.acquire();
    try {
      const user: UserModel = await getUserFromSocket(
        socket,
        this.redisUserRepository,
      );
      if (!user) {
        console.log('user not found');
        socket.disconnect();
        return;
      }
      console.log('join queue', user.nickname);

      if (user.queueSocket.id !== socket.id) {
        user.queueSocket.disconnect();
      }
      this.redisUserRepository.setSocket(user.id, 'queue', socket);
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
      console.log('user not found');
      socket.disconnect();
      return;
    }
    this.queueFactory.delete(user.id);
    await this.redisUserRepository.setSocket(user.id, 'queue', null);
  }

  async sendJoinGame(userId: number): Promise<void> {
    const user: UserModel = await this.redisUserRepository.findById(userId);
    user.queueSocket?.emit('matched', { roomId: user.gameId });
  }
}
