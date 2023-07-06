import { UserFactory } from 'src/domain/factory/user.factory';
import { GameService } from 'src/domain/game/game.service';
import { UserTestData } from 'src/test/data/user.test.data';
import { GameTestData } from 'src/test/data/game.test.data';
import { UserModel } from '../../../domain/factory/model/user.model';
import { DataSource } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from 'src/configs/typeorm.config';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { TestDataModule } from 'src/test/test.data.module';
import { GameModule } from 'src/domain/game/game.module';
import { GAMEMODE_CLASSIC } from 'src/global/type/type.game.mode';
import { FactoryModule } from 'src/domain/factory/factory.module';
import { AuthModule } from 'src/domain/auth/auth.module';
import { BadRequestException } from '@nestjs/common';
import { USERSTATUS_IN_GAME } from 'src/global/type/type.user.status';
import { DeleteGameInviteRejectDto } from 'src/domain/game/dto/delete.game.invite.reject.dto';

describe('GameService', () => {
  let service: GameService;
  let userFactory: UserFactory;
  let dataSource: DataSource;
  let userData: UserTestData;
  let gameData: GameTestData;

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
        TestDataModule,
        FactoryModule,
        GameModule,
        AuthModule,
      ],
    }).compile();

    service = module.get<GameService>(GameService);
    userFactory = module.get<UserFactory>(UserFactory);
    dataSource = module.get<DataSource>(DataSource);
    userData = module.get<UserTestData>(UserTestData);
    gameData = module.get<GameTestData>(GameTestData);
  });

  afterEach(async () => {
    userData.clear();
    userFactory.users.clear();
  });

  afterAll(async () => {
    await dataSource.destroy();
    await dataSource.dropDatabase();
  });

  describe('게임 초대', () => {
    it('[Valid Case] 일반 게임 초대 성공', async () => {
      const user1: UserModel = await userData.createUser('user1');
      const user2: UserModel = await userData.createUser('user2');
      const postDto = {
        senderId: user1.id,
        receiverId: user2.id,
        mode: GAMEMODE_CLASSIC,
      };

      await service.postGameInvite(postDto);
      const savedUserFt: UserModel = userFactory.findById(userData.users[0].id);

      expect(savedUserFt.invite.receiverId).toBe(userData.users[1].id);
    });

    it('[Error Case] 이미 초대된 유저에게 초대 불가능', async () => {
      const user1: UserModel = await userData.createUser('user1');
      const user2: UserModel = await userData.createUser('user2');
      await gameData.createGameInvite(user1, user2);

      const postDto = {
        senderId: user1.id,
        receiverId: user2.id,
        mode: GAMEMODE_CLASSIC,
      };

      await expect(service.postGameInvite(postDto)).rejects.toThrow(
        new BadRequestException('already invited'),
      );
    });

    it('[Error Case] 게임 중인 유저에게 초대 불가능', async () => {
      const user1: UserModel = await userData.createUser('user1');
      const user2: UserModel = await userData.createUser('user2');
      userFactory.setStatus(user2.id, USERSTATUS_IN_GAME);

      const postDto = {
        senderId: user1.id,
        receiverId: user2.id,
        mode: GAMEMODE_CLASSIC,
      };

      await expect(service.postGameInvite(postDto)).rejects.toThrow(
        new BadRequestException('already in game'),
      );
    });
  });
  describe('게임 초대 삭제', () => {
    it('[Valid Case] 게임 초대 삭제 성공', async () => {
      const user1: UserModel = await userData.createUser('user1');
      const user2: UserModel = await userData.createUser('user2');
      await gameData.createGameInvite(user1, user2);

      const deleteDto = {
        senderId: user1.id,
        receiverId: user2.id,
      };

      await service.deleteGameInvite(deleteDto);
      const savedUserFt: UserModel = userFactory.findById(userData.users[0].id);
      const receivedUserFt: UserModel = userFactory.findById(
        userData.users[1].id,
      );

      expect(savedUserFt.invite).toBeNull();
      expect(receivedUserFt.inviteList.size).toBe(0);
    });
  });
  describe('게임 초대 수락', () => {
    it('[Valid Case] 게임 초대 수락 성공', async () => {
      const user1: UserModel = await userData.createUser('user1');
      const user2: UserModel = await userData.createUser('user2');
      await gameData.createGameInvite(user1, user2);

      const postDto = {
        userId: user2.id,
        inviteId: user1.invite.id,
      };

      await service.postGameInviteAccept(postDto);

      const sendUserFt: UserModel = userFactory.findById(user1.id);
      const receivedUserFt: UserModel = userFactory.findById(user2.id);

      expect(sendUserFt.invite).toBeNull();
      expect(receivedUserFt.inviteList.size).toBe(0);
    });

    it('[Error Case] 유효하지 않은 초대 수락', async () => {
      const user1: UserModel = await userData.createUser('user1');
      const user2: UserModel = await userData.createUser('user2');
      await gameData.createGameInvite(user1, user2);

      const postDto = {
        userId: user2.id,
        inviteId: 'invalidId',
      };

      await expect(service.postGameInviteAccept(postDto)).rejects.toThrow(
        new BadRequestException('invalid invite'),
      );
    });
  });
  describe('게임 초대 거절', () => {
    it('[Valid Case] 게임 초대 거절 성공', async () => {
      const user1: UserModel = await userData.createUser('user1');
      const user2: UserModel = await userData.createUser('user2');
      await gameData.createGameInvite(user1, user2);

      const deleteDto: DeleteGameInviteRejectDto = {
        userId: user2.id,
        inviteId: user1.invite.id,
      };

      await service.deleteGameInviteReject(deleteDto);

      const sendUserFt: UserModel = userFactory.findById(user1.id);
      const receivedUserFt: UserModel = userFactory.findById(user2.id);

      expect(sendUserFt.invite).toBeNull();
      expect(receivedUserFt.inviteList.size).toBe(0);
    });
  });
});
