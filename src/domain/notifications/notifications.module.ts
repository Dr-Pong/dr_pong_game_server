import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { FactoryModule } from '../factory/factory.module';
import { UserModule } from '../user/user.module';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [FactoryModule, UserModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
