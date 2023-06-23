import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/domain/auth/auth.module';
import { User } from 'src/domain/user/user.entity';
import { GameTestData } from './data/game.test.data';
import { UserTestData } from './data/user.test.data';
import { FactoryModule } from 'src/domain/factory/factory.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), FactoryModule, AuthModule],
  providers: [GameTestData, UserTestData],
  exports: [GameTestData, UserTestData],
})
export class TestDataModule {}
