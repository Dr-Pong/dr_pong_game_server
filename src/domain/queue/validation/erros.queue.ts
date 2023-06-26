import { BadRequestException } from '@nestjs/common';
import { UserModel } from 'src/domain/factory/model/user.model';

export function checkUserExist(user: UserModel): void {
  if (!user) {
    throw new BadRequestException('User not found');
  }
}
