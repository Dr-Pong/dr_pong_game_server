import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './domain/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from './configs/typeorm.config';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { DataSource } from 'typeorm';
import { FactoryModule } from './domain/factory/factory.module';
import { GameModule } from './domain/game/game.module';
import { ScheduleModule } from '@nestjs/schedule';
import { QueueModule } from './domain/queue/queue.module';
import { UserController } from './domain/user/user.controller';
import { UserModule } from './domain/user/user.module';
import { User } from './domain/user/user.entity';
import { UserRepository } from './domain/user/user.repository';
import { GatewayModule } from './domain/gateway/gateway.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory() {
        return typeORMConfig;
      },
      async dataSourceFactory(options) {
        if (!options) {
          throw new Error('Invalid options passed');
        }
        return addTransactionalDataSource({
          dataSource: new DataSource(options),
        });
      },
    }),
    AuthModule,
    FactoryModule,
    GameModule,
    ScheduleModule.forRoot(),
    QueueModule,
    UserModule,
    GatewayModule,
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AppController, UserController],
  providers: [AppService, UserRepository],
})
export class AppModule {}
