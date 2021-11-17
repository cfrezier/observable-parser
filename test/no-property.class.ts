import { combineLatest } from 'rxjs';
import { filter } from 'rxjs/operators';

export class NoProperty {

  constructor() {
    this.anyObservable$.pipe(untilDestroyed(this)).subscribe((used) => (doSomethingUsefull()));
  }
}
