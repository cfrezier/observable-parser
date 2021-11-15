import { combineLatest } from 'rxjs';
import { filter } from 'rxjs/operators';

export class NoProperty {

  constructor(anyObservable$: Observable<number>, anyObservable2$: Observable<number>) {
    this.anyObservable$.pipe(untilDestroyed(this)).subscribe((used) => (doSomethingUsefull()));
  }
}
