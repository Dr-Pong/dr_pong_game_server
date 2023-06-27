import { LadderQueueUser } from 'src/domain/factory/model/ladder-queue.user';
import { List } from 'src/global/utils/list';

export class LadderQueue {
  /**
   * sorted by ladder point
   *  */
  head: List<LadderQueueUser>;

  constructor() {
    this.head = new List<LadderQueueUser>(null);
  }

  add(user: LadderQueueUser): void {
    let tmp: List<LadderQueueUser> = this.head;
    while (tmp.data?.ladderPoint >= user.ladderPoint) {
      tmp = tmp.next;
    }
    const newNode: List<LadderQueueUser> = new List<LadderQueueUser>(user);
    newNode.next = tmp.next;
    tmp.next = newNode;
  }

  delete(userId: number): void {
    let tmp: List<LadderQueueUser> = this.head;
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
