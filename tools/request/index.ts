import {ajax, AjaxError, AjaxResponse} from 'rxjs/ajax';
import {catchError, map, of} from "rxjs";

type RequestHandler = (headers: Record<string, string>) => Record<string, string>;
type ResponseHandler<R, K> = (res: AjaxResponse<R>) => K;
type ErrorHandler = (err: AjaxError) => void;

export default class Request<R, K> {
  readonly #headers: Record<string, string> = {};
  #responseHandle?: ResponseHandler<R, K>;
  #errorHandle?: ErrorHandler;

  constructor(requestHandler?: RequestHandler, responseHandler?: ResponseHandler<R, K>, errorHandler?: ErrorHandler) {
    this.#responseHandle = responseHandler;
    this.#errorHandle = errorHandler;
    if (requestHandler) {
      this.#headers = requestHandler(this.#headers);
    }
  }

  get(url: string, headers?: Record<string, string>) {
    return new Promise((resolve, reject) => {
      ajax.get<R>(url, {...this.#headers,...headers})
        .pipe(
          map(item => this.#responseHandle ? this.#responseHandle(item) : item),
          catchError((error: AjaxError) => {
            this.#errorHandle && this.#errorHandle(error);
            reject(error);
            throw error
          })
        )
        .subscribe({
          next(res) {
            resolve(res);
          }
        });
    });
  }

  post<D>(url: string, body?: D, headers?: Record<string, string>) {
    return new Promise((resolve, reject) => {
      ajax.post<R>(url, body, {...this.#headers,...headers})
        .pipe(
          map(item => this.#responseHandle ? this.#responseHandle(item) : item),
          catchError((error: AjaxError) => {
            this.#errorHandle && this.#errorHandle(error);
            reject(error);
            throw error
          })
        )
        .subscribe({
          next(res) {
            resolve(res);
          }
        });
    });
  }

  put<D>(url: string, body?: D, headers?: Record<string, string>) {
    return new Promise((resolve, reject) => {
      ajax.put<R>(url, body, {...this.#headers,...headers})
        .pipe(
          map(item => this.#responseHandle ? this.#responseHandle(item) : item),
          catchError((error: AjaxError) => {
            this.#errorHandle && this.#errorHandle(error);
            reject(error);
            throw error
          })
        )
        .subscribe({
          next(res) {
            resolve(res);
          }
        });
    });
  }

  delete(url: string, headers?: Record<string, string>) {
    return new Promise((resolve, reject) => {
      ajax.delete<R>(url, {...this.#headers,...headers})
        .pipe(
          map(item => this.#responseHandle ? this.#responseHandle(item) : item),
          catchError((error: AjaxError) => {
            this.#errorHandle && this.#errorHandle(error);
            reject(error);
            throw error
          })
        )
        .subscribe({
          next(res) {
            resolve(res);
          }
        });
    });
  }
}