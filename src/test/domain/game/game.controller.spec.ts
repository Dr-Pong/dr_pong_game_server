import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { GameTestData } from 'src/test/data/game.test.data';
import { UserTestData } from 'src/test/data/user.test.data';
import { TestDataModule } from 'src/test/test.data.module';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { UserModel } from 'src/domain/factory/model/user.model';
import { GAMEMODE_CLASSIC, GameMode } from 'src/global/type/type.game.mode';

describe('GameController', () => {
  let app: INestApplication;
  let dataSources: DataSource;
  let gameData: GameTestData;
  let userData: UserTestData;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestDataModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    gameData = module.get<GameTestData>(GameTestData);
    userData = module.get<UserTestData>(UserTestData);
    dataSources = module.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await dataSources.dropDatabase();
    await dataSources.destroy();
    await app.close();
  });

  afterEach(async () => {
    jest.resetAllMocks();
    userData.clear();
  });

  describe('[POST]]', () => {
    describe('games/invitation/:nickname', () => {
      it('일반 게임 초대 성공', async () => {
        const user: UserModel = await userData.createUser('user');
        const target: UserModel = await userData.createUser('target');
        const token = await userData.giveTokenToUser(user);
        const mode: GameMode = GAMEMODE_CLASSIC;

        const response = await req(
          token,
          'POST',
          `/games/invitation/${target.nickname}`,
          { mode },
        );

        expect(response.status).toBe(201);
      });

      it('일반 게임 초대 실패 - 이미 초대한 유저', async () => {
        const user: UserModel = await userData.createUser('user');
        const target: UserModel = await userData.createUser('target');
        const token = await userData.giveTokenToUser(user);
        const mode: GameMode = GAMEMODE_CLASSIC;
        await req(token, 'POST', `/games/invitation/${target.nickname}`, {
          mode,
        });

        const response = await req(
          token,
          'POST',
          `/games/invitation/${target.nickname}`,
          { mode },
        );

        expect(response.status).toBe(400);
      });

      it('일반 게임 초대 실패 - 자기 자신 초대', async () => {
        const user: UserModel = await userData.createUser('user');
        const token = await userData.giveTokenToUser(user);
        const mode: GameMode = GAMEMODE_CLASSIC;

        const response = await req(
          token,
          'POST',
          `/games/invitation/${user.nickname}`,
          { mode },
        );

        expect(response.status).toBe(400);
      });
    });
  });
  describe('[PATCH]]', () => {
    describe('games/invitation/:id', () => {
      it('일반 게임 초대 수락 성공', async () => {
        const user: UserModel = await userData.createUser('user');
        const target: UserModel = await userData.createUser('target');
        await gameData.createGameInvite(user, target);
        const token = await userData.giveTokenToUser(target);

        const response = await req(
          token,
          'PATCH',
          `/games/invitation/${user.invite.id}`,
        );

        expect(response.status).toBe(200);
      });

      it('일반 게임 초대 수락 실패 - 초대가 없는 유저', async () => {
        const user: UserModel = await userData.createUser('user');
        const token = await userData.giveTokenToUser(user);

        const response = await req(
          token,
          'PATCH',
          `/games/invitation/${'invalid'}`,
        );

        expect(response.status).toBe(400);
      });

      it('일반 게임 초대 수락 실패 - 초대한 유저가 아닌 유저', async () => {
        const user: UserModel = await userData.createUser('user');
        const target: UserModel = await userData.createUser('target');
        const token = await userData.giveTokenToUser(target);
        await gameData.createGameInvite(user, target);

        const response = await req(
          token,
          'PATCH',
          `/games/invitation/${'invalid'}`,
        );

        expect(response.status).toBe(400);
      });
    });
  });
  describe('[DELETE]]', () => {
    describe('games/invitation', () => {
      it('일반 게임 초대 취소 성공', async () => {
        const user: UserModel = await userData.createUser('user');
        const target: UserModel = await userData.createUser('target');
        await gameData.createGameInvite(user, target);
        const token = await userData.giveTokenToUser(user);

        const response = await req(token, 'DELETE', `/games/invitation`);

        expect(response.status).toBe(200);
      });
    });
    describe('games/invitation/:id', () => {
      it('일반 게임 초대 거절 성공', async () => {
        const user: UserModel = await userData.createUser('user');
        const target: UserModel = await userData.createUser('target');
        await gameData.createGameInvite(user, target);
        const token = await userData.giveTokenToUser(target);

        const response = await req(
          token,
          'DELETE',
          `/games/invitation/${user.invite.id}`,
        );

        expect(response.status).toBe(200);
      });
    });
  });

  const req = async (
    token: string,
    method: string,
    url: string,
    body?: object,
  ) => {
    switch (method) {
      case 'GET':
        return request(app.getHttpServer())
          .get(url)
          .set({ Authorization: `Bearer ${token}` });
      case 'POST':
        return request(app.getHttpServer())
          .post(url)
          .set({ Authorization: `Bearer ${token}` })
          .send(body);
      case 'PATCH':
        return request(app.getHttpServer())
          .patch(url)
          .set({ Authorization: `Bearer ${token}` })
          .send(body);
      case 'DELETE':
        return request(app.getHttpServer())
          .delete(url)
          .set({ Authorization: `Bearer ${token}` });
    }
  };
});
