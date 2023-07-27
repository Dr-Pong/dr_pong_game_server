import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeORMConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  name: 'game-ser',
  host: 'game-db',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'game',
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  synchronize: true,
  poolSize: 10,
};
