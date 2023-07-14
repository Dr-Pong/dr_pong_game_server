import { LadderQueueUser } from 'src/domain/factory/model/ladder-queue.user';
import { List } from 'src/global/utils/list';

export class LadderQueue {
  /**
   * sorted by ladder point
   *  */
  head: List<LadderQueueUser>;
  size: number;

  constructor() {
    this.head = new List<LadderQueueUser>(null);
    this.size = 0;
  }

  add(user: LadderQueueUser): void {
    const newNode: List<LadderQueueUser> = new List<LadderQueueUser>(user);
    if (this.size === 0 || user.ladderPoint < this.head.data?.ladderPoint) {
      newNode.next = this.head;
      this.head = newNode;
      this.size++;
      return;
    }
    let tmp: List<LadderQueueUser> = this.head;
    /**
     * list를 오름차순으로 정렬하는 코드
     * 새로운 노드보다 ladderPoint가 큰 노드를 찾아서 그 노드 앞에 새로운 노드를 삽입한다.
     */
    while (tmp.next?.data?.ladderPoint < user.ladderPoint) {
      tmp = tmp.next;
    }
    newNode.next = tmp.next;
    tmp.next = newNode;

    this.size++;
    return;
  }

  delete(userId: number): void {
    let tmp: List<LadderQueueUser> = this.head;
    if (tmp.data?.userId === userId) {
      this.head = tmp.next;
      this.size--;
      return;
    }
    while (tmp?.next && tmp.next.data?.userId !== userId) {
      tmp = tmp.next;
    }
    if (tmp?.next?.data.userId === userId) {
      tmp.next.data = null;
      tmp.next = tmp.next.next;
      this.size--;
    }
  }
}
