import { combineLatest } from 'rxjs';
import { filter } from 'rxjs/operators';

export class CombineLatestWithFn {

  constructor() {
    combineLatest(this.array.map(item => item.obs$))
          .pipe(take(1))
          .subscribe((loadStatus: Array<boolean>) => {
            somethingUsefull();
          });

    combineLatest(this.things.toArray().map(item => item.obs$))
          .pipe(take(1))
          .subscribe(() => {
            somethingUsefull();
          });
  }
}
