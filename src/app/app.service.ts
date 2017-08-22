import { Injectable, OnInit } from '@angular/core';
import { Response, Http, Jsonp, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { TranslateService } from '@ngx-translate/core';
import 'rxjs/add/operator/map';
import { Router, RouterLink, Routes } from '@angular/router';

import { PreloaderService } from './preloader.service';

@Injectable()
export class AppService {
    static isGeolocationAvailable: boolean;
    static currentCoordinates: Object;

    private geo: Geolocation;

    public allCountries: Array<Object>;
    public currentCountry: Object;

    public citiesOfCountry: Array<string> = [];

    public searchPlaceholder = '';

    //  ======================= Subject for Filter.component.initNewPlace() =======================
    public changePlaceSubject: Subject<boolean> = new Subject();

    constructor(private translate: TranslateService,
                private http: Http,
                private preloader: PreloaderService,
                private router: Router,
                private jsonp: Jsonp) {

    // Init current country
        let savedCountry = localStorage.getItem('country');
            if (savedCountry) {
                this.currentCountry = JSON.parse(savedCountry);
                this.changeLanguage(this.currentCountry['lang']);
            } else {
             this.currentCountry =  {'name': 'UK', 'lang': 'en',
                  'country': 'uk', 'default': 'true',
                  'server': 'https://api.nestoria.co.uk',
                  'localeName': 'United Kingdom'};
            }

    // Init geolocation
        this.geo = navigator.geolocation;
        if ('geolocation' in navigator) {
            AppService.isGeolocationAvailable = true;
        } else {
            AppService.isGeolocationAvailable = false;
        }
        this.geo.getCurrentPosition(this.showPosition, this.showError);

    // Get all countries && add languages
        this.getCountries().subscribe((countries) => {
            this.allCountries = countries;
            let languages = [];
            this.allCountries.forEach((element) => {
               languages.push(element['lang']);
            });

            this.translate.addLangs(languages);
            this.translate.setDefaultLang('en');

            this.preloader.closeMainPreloader();

            // if current country is not in local storage
            if (this.allCountries['default']) {
                this.currentCountry = this.allCountries.filter((country) => {
                return country['name'] === 'UK' || country['name'] === 'United Kingdom';
            })[0];
            this.changeLanguage(this.currentCountry['lang']);
            }
        });

        // get cities by country
        let savedCities = JSON.parse(localStorage.getItem('cities'));
        if (savedCities) {
            this.citiesOfCountry = savedCities;
            this.searchPlaceholder = this.randomCity();
        } else {
            this.getCitiesByCountry(this.currentCountry['name'])
                .subscribe((cities) => {
                    this.preloader.startMainPreloader();

                    this.citiesOfCountry = cities;
                    this.preloader.closeMainPreloader();
                    this.searchPlaceholder = this.randomCity();

                    this.preloader.closeMainPreloader();
                });
        }
    }

    // =======================  GEOLOCATION =======================
    getCurrentCoordinates() {
        this.geo.getCurrentPosition(this.showPosition, this.showError);
        return AppService.currentCoordinates;
    }
    getGeolocationAvailable() {
        return AppService.isGeolocationAvailable;
    }
    // for 'geolocation.getCurrentPosition'
    private showPosition(position) {
        let spinner = new PreloaderService;
        spinner.startMainPreloader();

        AppService.isGeolocationAvailable = true;
        AppService.currentCoordinates = {};
        AppService.currentCoordinates['latitude'] = position.coords.latitude;
        AppService.currentCoordinates['longitude'] = position.coords.longitude;
        spinner.closeMainPreloader();
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

    // =======================  TRANSLATE =======================
    changeLanguage(language: string) {
        this.translate.use(language);
    }
    getCurrentLanguage() {
        return this.translate.currentLang;
    }

    //  ======================= COUNTRIES =======================
    getCountries(): Observable<Array<Object>> {
        return this.http.get('assets/countries.json').map((resp: Response) => {
            let allCountries = resp.json()['countries'];
            return allCountries;
        });
    }

     changeCountry(index: number) {
        let newCountry = this.allCountries[index];
        if (newCountry) {
            this.preloader.startMainPreloader();
            this.currentCountry = newCountry;
            localStorage.setItem('country', JSON.stringify(newCountry));

            this.changeLanguage(newCountry['lang']);

            this.getCitiesByCountry(newCountry['name'])
                .subscribe((cities) => {
                    this.citiesOfCountry = cities;
                    localStorage.setItem('cities', JSON.stringify(cities));
                    this.searchPlaceholder = this.randomCity();
                    this.preloader.closeMainPreloader();
                });
        }
    }

    setCurrentCountry(index: number) {
        this.currentCountry = this.allCountries[index];
        this.translate.use(this.currentCountry['lang']);
    }

    //  ======================= CITIES =======================
    getCitiesByCountry(country: string): Observable<Array<string>> {
        return this.http.get('assets/allCities.json').map((resp: Response) => {
            let citiesByCountry = resp.json()[country];
            return citiesByCountry;
        })
    }

    randomCity() {
        let maxCount = this.citiesOfCountry.length;
        let index = Math.floor(Math.random() * (maxCount + 1));
        return this.citiesOfCountry[index];
    }

    //  ======================= REQUEST =======================
    public convertObjectToParams(params: URLSearchParams, filter: Object): URLSearchParams {
        for (let propName in filter) {// check all properties
            if (filter.hasOwnProperty(propName)) {

                let filterParameter = filter[propName];

                // if current parameter is array
                if (filterParameter instanceof Array) {
                    if (filterParameter.length) {
                        let min;
                        let max;

                        for (let i = 0; i < filterParameter.length; i++) {
                            let curr = filterParameter[i];
                            if (curr) {
                                if (min === undefined) {
                                    min = i;
                                } else {
                                    max = i;
                                }
                            }
                        }
                        // if 4+ checked like room_max set room_max = undefined
                        if (max === 4) {
                            max = undefined;
                        }
                        // set room_min
                        if (min !== undefined) {
                            params.set(propName + '_min', min);
                        }
                        // set room_max
                        if (max !== undefined) {
                            params.set(propName + '_max', max);
                        }
                    }

                } else { // else current parameter boolean, string or number
                    switch (propName) {
                        case 'listing_type':
                            (filterParameter) ? params.set(propName, 'rent') : params.set(propName, 'buy');
                            break;
                        case 'number_of_results':
                            (filterParameter === true) ? params.set(propName, '50') : params.set(propName, '20');
                            break;
                        case 'has_photo':
                            if (filterParameter) {
                                params.set(propName, '1')
                            }
                            break;
                        default:
                            if (filterParameter) {
                                params.set(propName, filterParameter);
                            }
                            break;
                    }
                }

            }
        }
        return params;
    }

    public server(country: Object, filter: Object): Observable<Object> {
        let params = new URLSearchParams();
        // default required params
        params.set('country', country['country']);
        params.set('action', 'search_listings');
        params.set('encoding', 'json');
        params.set('callback', 'JSONP_CALLBACK');

        // custom params
        params = this.convertObjectToParams(params, filter);

        console.log('All the parameters');
        console.log(params);

        return this.jsonp.get(country['server'] + '/api', {search: params }).map((resp: Response) => {
            // add query parameters to URL (its for search history)
            let queryParamObj = {};
            params.paramsMap.forEach((element, index) => {
                queryParamObj[index] = element[0];
            });
            console.log('query param');
            console.log(queryParamObj);
            this.router.navigate([], { queryParams: queryParamObj});

            return resp.json();
        });
    }

    // ================================ Search history (cities)   ==================

    public rewriteSearchHistory(historyArray: Array<Object>) {
        localStorage.removeItem('searchHistory');
        localStorage.setItem('searchHistory', JSON.stringify(historyArray));
    }


    // ================================ history of locations (geolocator)   ==================
    public rewriteLocationHistory(locationsArray: Array<Object>) {
        localStorage.removeItem('locationHistory');
        localStorage.setItem('locationHistory', JSON.stringify(locationsArray));
    }

    //  ======================= SUBJECT METHODS for Filter.component.initNewPlace() =======================
    public changeNewPlace() {
        this.changePlaceSubject.next(true);
    }
}
