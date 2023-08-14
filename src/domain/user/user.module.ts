import { Module } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import { FactoryModule } from '../factory/factory.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { RedisRepositoryModule } from '../redis/redis.repository.module';

@Module({
  imports: [
    FactoryModule,
    TypeOrmModule.forFeature([User]),
    RedisRepositoryModule,
  ],
  providers: [UserRepository, UserService],
  exports: [UserService],
})
export class UserModule {}
