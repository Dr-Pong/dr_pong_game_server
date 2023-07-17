import { UserFactory } from 'src/domain/factory/user.factory';
import { Test, TestingModule } from '@nestjs/testing';
import { TestDataModule } from '../test.data.module';
import { FactoryModule } from 'src/domain/factory/factory.module';
import { UserTestData } from '../data/user.test.data';
import { NotificationsService } from 'src/domain/notifications/notifications.service';
import { UserModel } from 'src/domain/factory/model/user.model';
import { InviteModel } from 'src/domain/factory/model/invite.model';
import {
  GAMEMODE_CLASSIC,
  GAMEMODE_RANDOMBOUNCE,
} from 'src/global/type/type.game.mode';
import { InviteDto } from 'src/domain/notifications/dto/invite.dto';
import { NotificationsModule } from 'src/domain/notifications/notifications.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from 'src/configs/typeorm.config';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let userFactory: UserFactory;
  let userData: UserTestData;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(typeORMConfig),
        NotificationsModule,
        TestDataModule,
        FactoryModule,
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    userData = module.get<UserTestData>(UserTestData);
    userFactory = module.get<UserFactory>(UserFactory);
  });

  afterEach(async () => {
    userData.clear();
    userFactory.users.clear();
  });

  describe('게임 초대 알림 조회', () => {
    it('[Valid Case] 유저 게임 초대 알림 조회(empty case)', async () => {
      const user: UserModel = await userData.createUser('user');
      const invites: InviteDto[] = await service.getUserGameInvites({
        userId: user.id,
      });

      expect(invites.length).toBe(0);
    });
    it('[Valid Case] 클래식, 랜덤바운스 초대 2개 있는 경우', async () => {
      const classicGameInvitor: UserModel = await userData.createUser(
        'classic',
      );
      const randomBounceGameInvitor: UserModel = await userData.createUser(
        'randomBounce',
      );
      const receiver: UserModel = await userData.createUser('receiver');

      userFactory.invite(
        classicGameInvitor.id,
        receiver.id,
        new InviteModel(classicGameInvitor.id, receiver.id, GAMEMODE_CLASSIC),
      );
      userFactory.invite(
        randomBounceGameInvitor.id,
        receiver.id,
        new InviteModel(
          randomBounceGameInvitor.id,
          receiver.id,
          GAMEMODE_RANDOMBOUNCE,
        ),
      );

      const invites: InviteDto[] = await service.getUserGameInvites({
        userId: receiver.id,
      });

      expect(invites.length).toBe(2);
      expect(invites[0]).toHaveProperty('id');
      expect(invites[0]).toHaveProperty('from');
      expect(invites[0]).toHaveProperty('createdAt');

      expect(invites[0].from).toBe(classicGameInvitor.nickname);
      expect(invites[1].from).toBe(randomBounceGameInvitor.nickname);
    });

    it('[Error Case] 없는 유저인 경우', async () => {
      expect(
        async () =>
          await service.getUserGameInvites({
            userId: undefined,
          }),
      ).rejects.toThrowError();
    });
  });
});
