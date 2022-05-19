import {DebouncedFunction, DebounceReturn, FunctionWithArguments,} from './types';

export function debounce<F extends FunctionWithArguments>(
    fn: F, ms: number): DebounceReturn<F> {
  let timer: ReturnType<typeof setTimeout>;

  const debouncedFunc: DebouncedFunction<F> = (...args) =>
      new Promise((resolve) => {
        if (timer) {
          clearTimeout(timer);
        }

        timer = setTimeout(() => {
          resolve(fn(...(args as unknown[])));
        }, ms);
      });

  const teardown = () => clearTimeout(timer);

  return [debouncedFunc, teardown];
}
