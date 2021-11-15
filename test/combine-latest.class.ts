export class CombineLatest {

    obs$: Observable<number>;
    obs2$: Observable<number>;
    obs3$: Observable<number>;

    constructor(private store: Store<AppState>) {
        this.obs3$ = combineLatest([this.obs$, this.store.select(aNgrxSelector), this.obs2$]).pipe(
            map(([a, b, c]) => a + b + c)
        );
    }
}
