import { InviteDto } from 'src/domain/notifications/dto/invite.dto';

export class NotificationResponseDto {
  invitations: InviteDto[];

  constructor(invitations: InviteDto[]) {
    this.invitations = invitations;
  }
}
