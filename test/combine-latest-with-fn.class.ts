import { combineLatest } from 'rxjs';
import { filter } from 'rxjs/operators';

export class CombineLatestWithFn {

  constructor() {
    combineLatest(this.array.map(item => item.obs$))
          .pipe(take(1))
          .subscribe((loadStatus: Array<boolean>) => {
            this.updateDisplayedBlocInEtag();
            this.zoningPlanService.dispatchZoningEndEvent();
            this.registerReloadListener();

            // Prevent error when all observable blocs has been already resolved during subscription
            this.loadUnSubscriber$.next(true);
          });
  }
}
