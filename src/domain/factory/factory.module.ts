import { Module } from '@nestjs/common';
import { UserFactory } from './user.factory';
import { QueueFactory } from './queue.factory';
import { GameFactory } from './game.factory';

@Module({
  providers: [UserFactory, QueueFactory, GameFactory],
  exports: [UserFactory, QueueFactory, GameFactory],
})
export class FactoryModule {}
