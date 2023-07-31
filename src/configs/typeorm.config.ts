import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeORMConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  name: 'game-ser',
  host: 'game-db',
  port: 5432,
  username: process.env.GAME_DB_USER,
  password: process.env.GAME_DB_PASSWORD,
  database: process.env.GAME_DB_NAME,
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  synchronize: true,
  poolSize: 10,
};
