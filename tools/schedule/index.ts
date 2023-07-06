import {Observable, Subscriber, Subscription} from "rxjs";

type Task<T> = () => Promise<T>;
type Verify<T> = (res: T) => boolean;
type Receive<T> = (res: T) => void;
type VoidFunc = () => void;
type ErrorFunc = (err: Error) => void;

enum State {
  initialized,
  running,
  stopped,
}

export default class Schedule<T extends unknown> {
  #observable: Observable<T>;
  #state: State;
  #subscriber?: Subscriber<T>;
  #subscription?: Subscription;

  constructor(task: Task<T>, verify: Verify<T>, duration: number) {
    this.#state = State.initialized;
    this.#observable = new Observable<T>(subscriber => {
      this.#subscriber = subscriber;
      this.#runTask(subscriber, task, verify, duration).then();
    });
  }

  #sleep(duration: number) {
    return new Promise((resolve) => setTimeout(resolve, duration));
  }

  async #runTask(subscriber: Subscriber<T>, task: Task<T>, verify: Verify<T>, duration: number) {
    if (this.#state !== State.running) return;
    try {
      const res = await task();
      subscriber.next(res);
      const isCompleted = verify(res);
      if (isCompleted) {
        subscriber.complete();
        this.#subscription?.unsubscribe();
      } else {
        await this.#sleep(duration);
        await this.#runTask(subscriber, task, verify, duration);
      }
    } catch (err) {
      subscriber.error(err);
    }
  }

  run(receive: Receive<T>, errorFunc?: ErrorFunc, finish?: VoidFunc) {
    if (this.#state !== State.initialized) return;
    this.#state = State.running;
    this.#subscription = this.#observable.subscribe({
      next: receive,
      error: errorFunc,
      complete: finish
    })
  }

  stop() {
    if (this.#state !== State.running) return;
    this.#state = State.stopped;
    this.#subscriber?.complete();
    this.#subscription?.unsubscribe();
  }
}