import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { FactoryModule } from '../factory/factory.module';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [FactoryModule, GatewayModule],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
