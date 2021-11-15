import { combineLatest } from 'rxjs';
import { filter } from 'rxjs/operators';

export class NoPropertyCombine {

  constructor(anyObservable$: Observable<number>, anyObservable2$: Observable<number>) {
    combineLatest([
      anyObservable$,
      anyObservable2$.pipe(filter((a) => a.filterCheck()),
    ])
      .pipe(untilDestroyed(this))
      .subscribe(([a, b]) => {
        doSomethingUsefull();
      });
  }
}
