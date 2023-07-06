import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { FactoryModule } from '../factory/factory.module';

@Module({
  imports: [FactoryModule],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
