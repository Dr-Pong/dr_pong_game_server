import { Body, Controller, Post } from '@nestjs/common';
import { PostGatewayUserDto } from './dto/post.gateway.users.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post('/')
  async userPost(@Body() postDto: PostGatewayUserDto): Promise<void> {
    await this.userService.postUser(postDto);
  }
}
