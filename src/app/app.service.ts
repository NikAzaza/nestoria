import { Injectable, OnInit } from '@angular/core';
import { Response, Http} from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { PreloaderService } from './preloader.service';

@Injectable()
export class AppService {
    static isGeolocationAvailable: boolean;
    static currentCoordinates: Object;

    private geo: Geolocation;
    private preloader: PreloaderService = new PreloaderService;

    constructor() {
        this.geo = navigator.geolocation;
        if ('geolocation' in navigator) {
            AppService.isGeolocationAvailable = true;
        } else {
            AppService.isGeolocationAvailable = false;
        }
        this.geo.getCurrentPosition(this.showPosition, this.showError);
    }


    getCurrentCoordinates() {
        console.log('start get position');
        this.geo.getCurrentPosition(this.showPosition, this.showError);
        console.log('end of get position');
        return AppService.currentCoordinates;
    }
    getGeolocationAvailable() {
        return AppService.isGeolocationAvailable;
    }
    // for 'geolocation.getCurrentPosition'
    private showPosition(position) {
        AppService.isGeolocationAvailable = true;
        AppService.currentCoordinates = {};
        AppService.currentCoordinates['latitude'] = position.coords.latitude;
        AppService.currentCoordinates['longitude'] = position.coords.longitude;
        console.log('Complete!');
    }
    private showError(error) {
        AppService.isGeolocationAvailable = false;
        AppService.currentCoordinates = {};
        // switch (error.code) {
        //     case error.PERMISSION_DENIED:
        //         console.log('User denied the request for Geolocation');
        //         break;
        //     case error.POSITION_UNAVAILABLE:
        //         console.log('Location information is unavailable.');
        //         break;
        //     case error.TIMEOUT:
        //         console.log('The request to get user location timed out.');
        //         break;
        //     case error.UNKNOWN_ERROR:
        //         console.log('An unknown error occurred.');
        //         break;
        // }
    }

}
