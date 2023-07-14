import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { FactoryModule } from '../factory/factory.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [FactoryModule, UserModule],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
