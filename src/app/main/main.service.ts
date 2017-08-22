import {Injectable} from '@angular/core';
import {Jsonp, RequestOptions, URLSearchParams, Headers, Response, Http} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Injectable()
export class MainService {

    constructor(private jsonp: Jsonp,
                private http: Http) { }

    sendRequest(server) {
        const urlWithBasicParam = server + '/api?callback=JSONP_CALLBACK&';

 /* Plain-text search  ===>
 http://api.nestoria.co.uk/api?country=uk&pretty=1&action=search_listings&encoding=json&listing_type=buy&page=1&place_name=newcr*/

 /* Location-based search ===>
http://api.nestoria.co.uk/api?
 country=uk&pretty=1&action=search_listings&encoding=json&listing_type=buy&page=1&centre_point=51.684183,-3.431481
 */
        //return this.jsonp.get(urlWithBasicParam + 'action=metadata&encoding=json&foo=bar')
       /* return this.jsonp.request(urlWithBasicParam +
             'action=echo& encoding = json&foo=bar'
            // 'action=search_listings&encoding=json&place_name=London')
            .map((res) => res.json());*/
    }

    getCountries(): Observable<Array<Object>> {
        return this.http.get('assets/countries.json').map((resp: Response) => {
            let allCountries = resp.json()['countries'];
            return allCountries;
        });
    }


    getCities(): Observable<Object> {
        return this.http.get('assets/allCities.json').map((resp: Response) => {
            let citiesByCountry = resp.json();
            return citiesByCountry;
        });
    }

    getCitiesByCountry(country: string): Observable<Array<string>> {
        return this.http.get('assets/allCities.json').map((resp: Response) => {
            let citiesByCountry = resp.json()[country];
            return citiesByCountry;
        })
    }
}
