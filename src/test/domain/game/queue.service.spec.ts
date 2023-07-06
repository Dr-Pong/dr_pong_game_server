import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { randomInt } from 'crypto';
import { typeORMConfig } from 'src/configs/typeorm.config';
import { FactoryModule } from 'src/domain/factory/factory.module';
import { UserModel } from 'src/domain/factory/model/user.model';
import { QueueFactory } from 'src/domain/factory/queue.factory';
import { UserFactory } from 'src/domain/factory/user.factory';
import { QueueModule } from 'src/domain/queue/queue.module';
import { QueueService } from 'src/domain/queue/queue.service';
import { GAMEMODE_CLASSIC } from 'src/global/type/type.game.mode';
import { GAMETYPE_LADDER } from 'src/global/type/type.game.type';
import { UserTestData } from 'src/test/data/user.test.data';
import { TestDataModule } from 'src/test/test.data.module';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';
function sleep(sec) {
  return new Promise((resolve) => setTimeout(resolve, sec * 1000));
} // 함수정의

describe('QueueService', () => {
  let service: QueueService;
  let userFactory: UserFactory;
  let queueFactory: QueueFactory;
  let dataSource: DataSource;
  let userData: UserTestData;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
        FactoryModule,
        QueueModule,
        TestDataModule,
      ],
    }).compile();

    service = module.get<QueueService>(QueueService);
    userFactory = module.get<UserFactory>(UserFactory);
    queueFactory = module.get<QueueFactory>(QueueFactory);
    dataSource = module.get<DataSource>(DataSource);
    userData = module.get<UserTestData>(UserTestData);
  });

  afterEach(async () => {
    userData.clear();
    userFactory.users.clear();
  });

  afterAll(async () => {
    await dataSource.destroy();
    await dataSource.dropDatabase();
  });

  describe('큐 입장 테스트', () => {
    it('[Valid Case] 래더 큐 입장', async () => {
      for (let i = 0; i < 51; i++) {
        const user: UserModel = await userData.createUserWithLp(
          'user' + (i * 2).toString(),
          randomInt(500, 1500),
        );
        await service.postQueue({
          userId: user.id,
          type: GAMETYPE_LADDER,
          mode: GAMEMODE_CLASSIC,
        });
      }
      queueFactory.ladderQueue.print();

      for (let i = 0; i < 100; i++) {
        await sleep(1);
        console.log(
          i.toString() + '초 경과',
          '남은 인원: ',
          queueFactory.ladderQueue.size,
        );
        await service.matching();
        if (i % 2 == 0) {
          const user: UserModel = await userData.createUserWithLp(
            'user' + (i * 2 + 1).toString(),
            randomInt(500, 1500),
          );
          console.log('new user: ', user.id, 'lp: ', user.ladderPoint);
          await service.postQueue({
            userId: user.id,
            type: GAMETYPE_LADDER,
            mode: GAMEMODE_CLASSIC,
          });
        }
        if (queueFactory.ladderQueue.size === 0) break;
      }
    }, 1000000);

    it.only('[Valid Case] 게임 간단', async () => {
      for (let i = 0; i < 2; i++) {
        const user: UserModel = await userData.createUserWithLp(
          'user' + (i * 2).toString(),
          randomInt(999, 1000),
        );
        await service.postQueue({
          userId: user.id,
          type: GAMETYPE_LADDER,
          mode: GAMEMODE_CLASSIC,
        });
      }

      await sleep(1);
      await service.matching();
      for (let i = 0; i < 100; i++) {
        await sleep(1);
      }
    }, 100000000);
  });
});
