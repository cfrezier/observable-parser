export class NgrxStore {

    obs$: Observable<number>;
    obs2$: Observable<number>;

    constructor(private store: Store<AppState>) {
        this.obs$ = this.store.select(aNgrxSelector);
        this.obs2$ = this.step$.pipe(map(step => step + 1));
    }
}
