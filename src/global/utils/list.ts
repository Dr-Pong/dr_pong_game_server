export class List<T> {
  data: T;
  next: List<T>;
  prev: List<T>;

  constructor(data: T) {
    this.data = data;
    this.next = null;
    this.prev = null;
  }
}
