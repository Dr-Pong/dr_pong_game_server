import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from 'src/configs/typeorm.config';
import { FactoryModule } from 'src/domain/factory/factory.module';
import { GameFactory } from 'src/domain/factory/game.factory';
import { GameModel } from 'src/domain/factory/model/game.model';
import { UserModel } from 'src/domain/factory/model/user.model';
import { QueueFactory } from 'src/domain/factory/queue.factory';
import { UserFactory } from 'src/domain/factory/user.factory';
import { QueueModule } from 'src/domain/queue/queue.module';
import { QueueService } from 'src/domain/queue/queue.service';
import { NormalQueue } from 'src/domain/queue/utils/normal.queue';
import {
  GAMEMODE_CLASSIC,
  GAMEMODE_RANDOMBOUNCE,
} from 'src/global/type/type.game.mode';
import {
  GAMETYPE_LADDER,
  GAMETYPE_NORMAL,
} from 'src/global/type/type.game.type';
import { UserTestData } from 'src/test/data/user.test.data';
import { TestDataModule } from 'src/test/test.data.module';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';

describe('QueueService', () => {
  let service: QueueService;
  let userFactory: UserFactory;
  let queueFactory: QueueFactory;
  let gameFactory: GameFactory;
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
    gameFactory = module.get<GameFactory>(GameFactory);
    dataSource = module.get<DataSource>(DataSource);
    userData = module.get<UserTestData>(UserTestData);
  });

  afterEach(async () => {
    userData.clear();
    userFactory.users.clear();
    while (queueFactory.ladderQueue.size > 0) {
      queueFactory.ladderQueue.delete(
        queueFactory.ladderQueue.head.data.userId,
      );
    }
    while (queueFactory.normalQueue.size > 0) {
      queueFactory.normalQueue.delete(
        queueFactory.normalQueue.head.data.userId,
      );
    }
    gameFactory.games.clear();
  });

  afterAll(async () => {
    await dataSource.dropDatabase();
    await dataSource.destroy();
  });

  describe('큐 입장 테스트', () => {
    /**
     * 래더 큐 입장은 웹서버의 axios 요청이 필요한 관계로 테스트 불가
     */

    it('[Valid Case] 일반 큐 입장', async () => {
      const user1: UserModel = await userData.createUser('user1');
      await service.postQueue({
        userId: user1.id,
        type: GAMETYPE_NORMAL,
        mode: GAMEMODE_CLASSIC,
      });

      const queue: NormalQueue = queueFactory.normalQueue;

      expect(queue.size).toBe(1);
      const tmp = queue.head;
      expect(tmp.data.userId).toBe(user1.id);
      const user2: UserModel = await userData.createUser('user2');
      await service.postQueue({
        userId: user2.id,
        type: GAMETYPE_NORMAL,
        mode: GAMEMODE_CLASSIC,
      });
      expect(queue.size).toBe(2);
      expect(tmp.next.data.userId).toBe(user2.id);

      const user3: UserModel = await userData.createUser('user3');

      await service.postQueue({
        userId: user3.id,
        type: GAMETYPE_NORMAL,
        mode: GAMEMODE_CLASSIC,
      });

      expect(queue.size).toBe(3);
      expect(tmp.next.next.data.userId).toBe(user3.id);
    });

    it('[Error Case] 이미 큐에 있는 유저가 다시 큐에 들어감', async () => {
      const user1: UserModel = await userData.createUser('user1');
      await service.postQueue({
        userId: user1.id,
        type: GAMETYPE_NORMAL,
        mode: GAMEMODE_CLASSIC,
      });

      expect(async () =>
        service.postQueue({
          userId: user1.id,
          type: GAMETYPE_NORMAL,
          mode: GAMEMODE_CLASSIC,
        }),
      ).rejects.toThrowError(new BadRequestException('Already in queue'));
    });

    it('[Error Case] 게임중인 유저가 다시 큐에 들어감', async () => {
      const user1: UserModel = await userData.createUser('user1');
      userFactory.setGameId(user1.id, '1');

      expect(async () =>
        service.postQueue({
          userId: user1.id,
          type: GAMETYPE_NORMAL,
          mode: GAMEMODE_CLASSIC,
        }),
      ).rejects.toThrowError(new BadRequestException('Already in game'));
    });
  });

  it('[Valid Case] 매칭 테스트(래더) - 게임 생성, 초기화 확인', async () => {
    const user1: UserModel = await userData.createUser('user1');
    const user2: UserModel = await userData.createUser('user2');
    queueFactory.addLadderQueue(user1.id, 1000);
    queueFactory.addLadderQueue(user2.id, 1000);

    await service.matching();

    const user1AfterMatched: UserModel = userFactory.users.get(user1.id);
    const user2AfterMatched: UserModel = userFactory.users.get(user2.id);

    const game: GameModel = gameFactory.findById(user1AfterMatched.gameId);

    expect(queueFactory.ladderQueue.size).toBe(0);
    expect(game).toBeDefined();
    expect(user1AfterMatched.gameId).toBe(game.id);
    expect(user2AfterMatched.gameId).toBe(game.id);
    expect(game.type).toBe(GAMETYPE_LADDER);
    expect(game.mode).toBe(GAMEMODE_CLASSIC);
    expect(game.ball.size).toBe(+process.env.BALL_SIZE);
    expect(game.board.width).toBe(+process.env.BOARD_WIDTH);
    expect(game.board.height).toBe(+process.env.BOARD_HEIGHT);
    expect(game.player1.id).toBe(user1.id);
    expect(game.player2.id).toBe(user2.id);
    expect(game.player1.isReady).toBe(false);
    expect(game.player2.isReady).toBe(false);
    expect(game.player1.score).toBe(0);
    expect(game.player2.score).toBe(0);
  });

  it('[Valid Case] 매칭 테스트(래더) - 점수대별로 매칭 되는지', async () => {
    const user1: UserModel = await userData.createUser('user1');
    const user2: UserModel = await userData.createUser('user2');
    const user3: UserModel = await userData.createUser('user1');
    const user4: UserModel = await userData.createUser('user2');
    queueFactory.addLadderQueue(user1.id, 100);
    queueFactory.addLadderQueue(user2.id, 1000);
    queueFactory.addLadderQueue(user3.id, 120);
    queueFactory.addLadderQueue(user4.id, 1020);

    await service.matching();

    const user1AfterMatched: UserModel = userFactory.users.get(user1.id);
    const game1: GameModel = gameFactory.findById(user1AfterMatched.gameId);

    const user2AfterMatched: UserModel = userFactory.users.get(user2.id);
    const game2: GameModel = gameFactory.findById(user2AfterMatched.gameId);

    expect(queueFactory.ladderQueue.size).toBe(0);
    expect(game1).toBeDefined();
    expect(game1.player1.id).toBe(user1.id);
    expect(game1.player2.id).toBe(user3.id);
    expect(game2).toBeDefined();
    expect(game2.player1.id).toBe(user2.id);
    expect(game2.player2.id).toBe(user4.id);
  });

  it('[Valid Case] 매칭 테스트(일반) - 모드별로 매칭 되는지', async () => {
    const user1: UserModel = await userData.createUser('user1');
    const user2: UserModel = await userData.createUser('user2');
    const user3: UserModel = await userData.createUser('user1');
    const user4: UserModel = await userData.createUser('user2');

    queueFactory.addNormalQueue(user1.id, GAMEMODE_CLASSIC);
    queueFactory.addNormalQueue(user2.id, GAMEMODE_RANDOMBOUNCE);
    queueFactory.addNormalQueue(user3.id, GAMEMODE_CLASSIC);
    queueFactory.addNormalQueue(user4.id, GAMEMODE_RANDOMBOUNCE);

    await service.matching();

    const user1AfterMatched: UserModel = userFactory.users.get(user1.id);
    const game1: GameModel = gameFactory.findById(user1AfterMatched.gameId);

    const user2AfterMatched: UserModel = userFactory.users.get(user2.id);
    const game2: GameModel = gameFactory.findById(user2AfterMatched.gameId);

    expect(queueFactory.normalQueue.size).toBe(0);
    expect(game1).toBeDefined();
    expect(game1.player1.id).toBe(user1.id);
    expect(game1.player2.id).toBe(user3.id);
    expect(game1.mode).toBe(GAMEMODE_CLASSIC);
    expect(game2).toBeDefined();
    expect(game2.player1.id).toBe(user2.id);
    expect(game2.player2.id).toBe(user4.id);
    expect(game2.mode).toBe(GAMEMODE_RANDOMBOUNCE);
  });

  it('[Valid Case] 매칭 테스트(혼합) - 일반, 래더 각각 매칭 되는지', async () => {
    const ladderUser1: UserModel = await userData.createUser('luser1');
    const ladderUser2: UserModel = await userData.createUser('luser2');
    const ladderUser3: UserModel = await userData.createUser('luser3');
    const ladderUser4: UserModel = await userData.createUser('luser4');
    const normalUser1: UserModel = await userData.createUser('nuser1');
    const normalUser2: UserModel = await userData.createUser('nuser2');
    const normalUser3: UserModel = await userData.createUser('nuser3');
    const normalUser4: UserModel = await userData.createUser('nuser4');

    queueFactory.addLadderQueue(ladderUser1.id, 990);
    queueFactory.addNormalQueue(normalUser4.id, GAMEMODE_RANDOMBOUNCE);
    queueFactory.addLadderQueue(ladderUser4.id, 1000);
    queueFactory.addNormalQueue(normalUser1.id, GAMEMODE_CLASSIC);
    queueFactory.addLadderQueue(ladderUser2.id, 1030);
    queueFactory.addNormalQueue(normalUser3.id, GAMEMODE_RANDOMBOUNCE);
    queueFactory.addLadderQueue(ladderUser3.id, 1020);
    queueFactory.addNormalQueue(normalUser2.id, GAMEMODE_CLASSIC);

    await service.matching();

    const ladderUser1AfterMatched: UserModel = userFactory.users.get(
      ladderUser1.id,
    );
    const ladderGame1: GameModel = gameFactory.findById(
      ladderUser1AfterMatched.gameId,
    );

    const ladderUser2AfterMatched: UserModel = userFactory.users.get(
      ladderUser2.id,
    );

    const ladderGame2: GameModel = gameFactory.findById(
      ladderUser2AfterMatched.gameId,
    );

    const normalUser1AfterMatched: UserModel = userFactory.users.get(
      normalUser1.id,
    );

    const normalGame1: GameModel = gameFactory.findById(
      normalUser1AfterMatched.gameId,
    );

    const normalUser3AfterMatched: UserModel = userFactory.users.get(
      normalUser3.id,
    );

    const normalGame2: GameModel = gameFactory.findById(
      normalUser3AfterMatched.gameId,
    );

    expect(queueFactory.ladderQueue.size).toBe(0);
    expect(queueFactory.normalQueue.size).toBe(0);
    expect(ladderGame1).toBeDefined();
    expect(ladderGame1.player1.id).toBe(ladderUser1.id);
    expect(ladderGame1.player2.id).toBe(ladderUser4.id);
    expect(ladderGame2).toBeDefined();
    expect(ladderGame2.player1.id).toBe(ladderUser3.id);
    expect(ladderGame2.player2.id).toBe(ladderUser2.id);

    expect(normalGame1).toBeDefined();
    expect(normalGame1.player1.id).toBe(normalUser1.id);
    expect(normalGame1.player2.id).toBe(normalUser2.id);
    expect(normalGame1.mode).toBe(GAMEMODE_CLASSIC);
    expect(normalGame2).toBeDefined();
    expect(normalGame2.player1.id).toBe(normalUser4.id);
    expect(normalGame2.player2.id).toBe(normalUser3.id);
    expect(normalGame2.mode).toBe(GAMEMODE_RANDOMBOUNCE);
  });
});
