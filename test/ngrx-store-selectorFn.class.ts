export class NgrxStoreSelectorFn {

    obs$: Observable<number>;

    constructor(private store: Store<AppState>) {
        this.obs$ = this.store.select(aNgrxSelectorFn(params);
    }
}
