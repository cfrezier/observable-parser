export class SimpleObservable {

    obs$: Observable<number>;
    obs2$: Observable<number>;
    classic = false;

    constructor() {
        this.obs$ = this.obs2$.pipe(map(a => a + 1));
    }

    classicFn(): void {
        this.classic = true;
    }
}
