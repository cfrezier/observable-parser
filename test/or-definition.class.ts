import { combineLatest } from 'rxjs';
import { filter } from 'rxjs/operators';

export class OrDefinition {

    obs$: Observable<number>;
    obs2$: Observable<number>;
    obs3$: Observable<number>;

  constructor() {
    this.obs$ = this.obs2$ ? this.obs2$ : this.obs3$;
  }
}
