import {Injectable} from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class PreloaderService {
    public mainSpinnerSubject: Subject<boolean> = new Subject();

    setMainPreloader(state: boolean) {
        this.mainSpinnerSubject.next(state);
    }

    startMainPreloader() {
        this.mainSpinnerSubject.next(true);
    }

    closeMainPreloader() {
        this.mainSpinnerSubject.next(false);
    }
}
