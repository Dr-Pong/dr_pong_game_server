import { NormalQueueUser } from 'src/domain/factory/model/normal-queue.user';
import { List } from 'src/global/utils/list';

export class NormalQueue {
  head: List<NormalQueueUser>;

  constructor() {
    this.head = new List<NormalQueueUser>(null);
  }

  add(user: NormalQueueUser): void {
    let tmp: List<NormalQueueUser> = this.head;
    while (tmp.data?.gameMode >= user.gameMode) {
      tmp = tmp.next;
    }
    const newNode: List<NormalQueueUser> = new List<NormalQueueUser>(user);
    newNode.next = tmp.next;
    tmp.next = newNode;
  }

  delete(userId: number): void {
    let tmp: List<NormalQueueUser> = this.head;
    while (tmp.data?.userId === userId) {
      tmp = tmp.next;
    }
    if (tmp.data) {
      tmp.prev.next = tmp.next;
      tmp.next.prev = tmp.prev;
      tmp.next = null;
      tmp.data = null;
      tmp.prev = null;
    }
  }
}
