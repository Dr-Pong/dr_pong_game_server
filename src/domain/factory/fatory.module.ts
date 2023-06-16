import { Module } from '@nestjs/common';
import { UserFactory } from './user.factory';
import { QueueFactory } from './queue.factory';

@Module({
  providers: [UserFactory, QueueFactory],
  exports: [UserFactory, QueueFactory],
})
export class FactoryModule {}
