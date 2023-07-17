import { Injectable } from '@nestjs/common';
import { GameFactory } from '../factory/game.factory';
import { GameModel } from '../factory/model/game.model';
import { UserFactory } from '../factory/user.factory';
import { UserModel } from '../factory/model/user.model';
import { PostGameDto } from './dto/post.game.dto';
import { PostGameResponseDto } from './dto/post.game.response.dto';

@Injectable()
export class GameService {
  constructor(
    private readonly userFactory: UserFactory,
    private readonly gameFactory: GameFactory,
  ) {}

  async postGame(postDto: PostGameDto): Promise<PostGameResponseDto> {
    const { type, mode } = postDto;
    const user1: UserModel = this.userFactory.findById(postDto.user1Id);
    const user2: UserModel = this.userFactory.findById(postDto.user2Id);
    const gameId: string = this.gameFactory.create(
      new GameModel(user1, user2, type, mode),
    ).id;
    this.userFactory.setGameId(user1.id, gameId);
    this.userFactory.setGameId(user2.id, gameId);
    return { gameId };
  }
}
