import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Requestor } from '../auth/jwt/auth.requestor.decorator';
import { UserIdCardDto } from '../auth/jwt/auth.user.id-card.dto';
import { NotificationResponseDto } from './dto/notification.response.dto';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationService: NotificationsService) {}

  @Get('/notifications/games')
  @UseGuards(AuthGuard('jwt'))
  async GameNotificationsGet(
    @Requestor() requestor: UserIdCardDto,
  ): Promise<NotificationResponseDto> {
    const { id: userId } = requestor;

    return new NotificationResponseDto(
      await this.notificationService.getUserGameInvites({ userId }),
    );
  }
}
