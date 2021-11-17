export class UsingInjection {

    obs$: Observable<number>;

    constructor(private service: Service) {
        this.obs$ = this.service.obs1$;
    }
}
