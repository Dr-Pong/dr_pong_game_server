import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Requestor } from '../auth/jwt/auth.requestor.decorator';
import { UserIdCardDto } from '../auth/jwt/auth.user.id-card.dto';
import { GameMode } from 'src/global/type/type.game.mode';
import { AuthGuard } from '@nestjs/passport';
import { QueueService } from '../queue/queue.service';
import { GameType } from 'src/global/type/type.game.type';
import { PostQueueDto } from '../queue/dto/post.queue.dto';
import { DeleteQueueDto } from '../queue/dto/delete.queue.dto';
import { GameService } from './game.service';
import { PostGameRequestDto } from './dto/post.game.request.dto';
import { PostGameResponseDto } from './dto/post.game.response.dto';

@Controller('/games')
export class GameController {
  constructor(
    private readonly queueService: QueueService,
    private readonly gameService: GameService,
  ) {}

  @Post('/')
  async gamePost(
    @Body() body: PostGameRequestDto,
  ): Promise<PostGameResponseDto> {
    const { user1Id, user2Id, type, mode } = body;
    return await this.gameService.postGame({ user1Id, user2Id, type, mode });
  }

  @Post('/queue/:type')
  @UseGuards(AuthGuard('jwt'))
  async gameQueuePost(
    @Requestor() requestor: UserIdCardDto,
    @Param('type') type: GameType,
    @Body('mode') mode: GameMode,
  ): Promise<void> {
    const { id: userId } = requestor;
    const postDto = new PostQueueDto(userId, type, mode);
    await this.queueService.postQueue(postDto);
  }

  @Delete('/queue')
  @UseGuards(AuthGuard('jwt'))
  async gameQueueDelete(@Requestor() requestor: UserIdCardDto): Promise<void> {
    const { id: userId } = requestor;
    const deleteDto = new DeleteQueueDto(userId);
    await this.queueService.deleteQueue(deleteDto);
  }
}
