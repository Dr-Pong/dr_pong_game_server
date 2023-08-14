import { GamePlayerModel } from '../../factory/model/game-player.model';

export class UserInitDto {
  me: {
    nickname: string;
    imgUrl: string;
    title: string;
  };
  opponent: {
    nickname: string;
    imgUrl: string;
    title: string;
  };

  constructor(me: GamePlayerModel, oppeonent: GamePlayerModel) {
    this.me = {
      nickname: me.nickname,
      imgUrl: me.imgUrl,
      title: me.title,
    };
    this.opponent = {
      nickname: oppeonent.nickname,
      imgUrl: oppeonent.imgUrl,
      title: oppeonent.title,
    };
  }
}
