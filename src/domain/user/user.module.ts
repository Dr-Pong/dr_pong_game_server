import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { FactoryModule } from '../factory/factory.module';
import { RedisRepositoryModule } from '../redis/redis.repository.module';

@Module({
  imports: [FactoryModule, RedisRepositoryModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
