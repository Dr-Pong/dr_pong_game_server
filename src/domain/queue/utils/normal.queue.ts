import { NormalQueueUser } from 'src/domain/factory/model/normal-queue.user';
import { List } from 'src/global/utils/list';

export class NormalQueue {
  head: List<NormalQueueUser>;
  size: number;

  constructor() {
    this.head = new List<NormalQueueUser>(null);
    this.size = 0;
  }

  add(user: NormalQueueUser): void {
    const newNode: List<NormalQueueUser> = new List<NormalQueueUser>(user);
    if (this.size === 0) {
      newNode.next = this.head;
      this.head = newNode;
      this.size++;
      return;
    }
    let tmp: List<NormalQueueUser> = this.head;
    /**
     * 자신과 같은 모드의 유저를 찾아서 그 뒤에 새로운 노드를 삽입한다.
     */
    while (tmp.next?.data && tmp?.data?.gameMode !== user.gameMode) {
      tmp = tmp.next;
    }
    while (tmp.next?.data && tmp.next.data?.gameMode === user.gameMode) {
      tmp = tmp.next;
    }
    newNode.next = tmp.next;
    tmp.next = newNode;

    this.size++;
  }

  delete(userId: number): void {
    let tmp: List<NormalQueueUser> = this.head;
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
