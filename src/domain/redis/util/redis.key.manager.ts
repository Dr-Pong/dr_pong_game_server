export class KeyManager {
  static userIdKey = 'GAME_USER:ID:';
  static userNicknameKey = 'GAME_USER:NICKNAME:';
  static gameKey = 'GAME_ID:';

  static generateUserIdKey(userId: number): string {
    return this.userIdKey + userId.toString();
  }

  static generateUserNickNameKey(nickname: string): string {
    return this.userNicknameKey + nickname;
  }

  static generateGameKey(gameId: string): string {
    return this.gameKey + gameId;
  }
}
