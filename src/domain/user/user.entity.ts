import { BaseTimeEntity } from 'src/global/base-entity/base-time.entity';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class User extends BaseTimeEntity {
  @PrimaryColumn()
  id: number;

  @Column({ name: 'nickname' })
  nickname: string;
}
