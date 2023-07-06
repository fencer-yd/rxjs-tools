import {from, mergeMap, Observable} from "rxjs";

type TaskFunc<T> = () => Promise<T>;
type Task<T> = {
  id: string;
  task: TaskFunc<T>;
}
type Handle<T> = (res: T) => void;
export default class TaskingScheduling<T> {
  readonly #task: Array<Task<T>> = [];

  constructor(task: TaskFunc<T>[]) {
    this.#task = task.map(item => ({
      id: new Date().getTime() + '' + Math.random().toString(36).substring(2),
      task: item
    }));
  }

  #asyncTask(task: Task<T>) {
    return new Observable<T>(observer => {
      task.task().then(res => {
        observer.next(res);
        observer.complete();
      }).catch(error => {
        observer.error(error);
      })
    });
  }

  start(callback: Handle<T>, errorHandler: (error: unknown) => void, synchronization: number = 1) {
    from(this.#task).pipe(
      mergeMap((task) => this.#asyncTask(task), synchronization)
    ).subscribe({
      next: (results) => {
        callback(results);
      },
      error: (error) => {
        errorHandler(error);
      }
    })
  }
}