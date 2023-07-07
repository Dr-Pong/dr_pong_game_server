import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { FactoryModule } from '../factory/factory.module';
import { QueueGateway } from './queue.gateway';

@Module({
  imports: [FactoryModule],
  providers: [QueueService, QueueGateway],
  exports: [QueueService, QueueGateway],
})
export class QueueModule {}
