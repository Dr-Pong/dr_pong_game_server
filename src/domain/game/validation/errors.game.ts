import { UserModel } from 'src/domain/factory/model/user.model';
import { BadRequestException } from '@nestjs/common';
import { InviteModel } from 'src/domain/factory/model/invite.model';
import { USERSTATUS_IN_GAME } from 'src/global/type/type.user.status';

export function validateUser(sendUser: UserModel, receivedUser: UserModel) {
  if (receivedUser === sendUser) {
    throw new BadRequestException('invalid user');
  }
}

export function checkAlreadyInvited(receivedUser: UserModel, senderId: number) {
  const invite: InviteModel = Array.from(receivedUser.inviteList.values()).find(
    (invite) => invite.senderId === senderId,
  );

  if (invite) {
    throw new BadRequestException('already invited');
  }
}

export function checkAlreadyInGame(receivedUser: UserModel) {
  if (receivedUser.status === USERSTATUS_IN_GAME) {
    throw new BadRequestException('already in game');
  }
}

export function validateInvite(invitation: InviteModel) {
  if (!invitation) {
    throw new BadRequestException('invalid invite');
  }
}
