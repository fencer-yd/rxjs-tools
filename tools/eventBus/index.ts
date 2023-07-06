import {Observable, share, Subject, Subscription} from "rxjs";

type EventCallback<T extends unknown> = (arg: T) => void;
type ErrorCallback = (error: unknown) => void;
type FinishCallback = () => void;

class EventBus {
  static #instance?: EventBus;
  subjects: Map<string, Subject<any>> = new Map();
  subscriptionMap: Map<string, Subscription[]> = new Map();
  static get instance() {
    if (this.#instance) return this.#instance;
    return new EventBus();
  }

  addEventListener<T>(eventType: string, callback: EventCallback<T>, errorCallback: ErrorCallback, finish: FinishCallback) {
    const observer = {
      next: callback,
      error: errorCallback,
      completed: finish
    }
    const subject = this.subjects.get(eventType) as Subject<T>;
    let subscription: Subscription;
    if (subject) {
      const newObservable = subject.pipe(share());
      subscription = newObservable.subscribe(observer);
    } else {
      const subject = new Subject<T>();
      this.subjects.set(eventType, subject);
      subscription = subject.subscribe(observer);
    }
    const subscriptions = this.subscriptionMap.get(eventType) ?? [];
    this.subscriptionMap.set(eventType, [...subscriptions, subscription]);
    return subscription;
  }

  emit<T>(eventType: string, data: T) {
    const subject = this.subjects.get(eventType) as Subject<T>;
    if (!subject) throw new Error('this event is not register');
    subject.next(data);
  }

  removeEventListener(eventType: string, subscription: Subscription) {
    const subscriptions = this.subscriptionMap.get(eventType) ?? [];
    const newSubscriptions = subscriptions.filter(item => item === subscription);
    subscription.unsubscribe();
    if (!newSubscriptions.length) {
      this.subscriptionMap.delete(eventType);
      this.subjects.delete(eventType);
    } else {
      this.subscriptionMap.set(eventType, newSubscriptions);
    }
  }
}

export default EventBus.instance;
