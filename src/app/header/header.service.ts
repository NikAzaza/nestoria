import { Injectable } from '@angular/core';
import { Jsonp, RequestOptions, URLSearchParams, Headers, Response, Http} from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Injectable()
export class HeaderService {
    constructor (private jsonp: Jsonp,
                 private http: Http) { }

    getCountries(): Observable<Array<Object>> {
        return this.http.get('assets/countries.json').map((resp: Response) => {
            let allCountries = resp.json()['countries'];
            return allCountries;
        });
    }

    /*getCities(): Observable<Object> {
        return this.http.get('assets/allCities.json').map((resp: Response) => {
            let cities = resp.json();
            return cities;
        });
    }*/

    getCitiesByCountry(country: string): Observable<Array<string>> {
        return this.http.get('assets/allCities.json').map((resp: Response) => {
            let citiesByCountry = resp.json()[country];
            return citiesByCountry;
        })
    }
}
