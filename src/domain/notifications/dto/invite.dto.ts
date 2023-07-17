export class InviteDto {
  id: string;
  from: string;
  createdAt: Date;

  constructor(id: string, from: string, createdAt: Date) {
    this.id = id;
    this.from = from;
    this.createdAt = createdAt;
  }
}
