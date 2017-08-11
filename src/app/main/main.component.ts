import { Component, OnInit } from '@angular/core';
import { Response, Http} from '@angular/http';
import { MainService } from './main.service';
import {Subscription} from 'rxjs';
import { AppService } from '../app.service';
import { PreloaderService } from '../preloader.service';

@Component({
    moduleId: module.id,
    selector: 'app-main',
    templateUrl: 'main.component.html',
    styleUrls: ['main.component.scss'],
    providers: [MainService]
})
export class MainComponent implements OnInit {
    private countriesArray: Array<Object>; // array with all countries objects
    public currentCountry: Object; // current object with server, name, language, etc

    private allCities: Object; // Object with all the cities
    private citiesOfCounry: Array<String> = []; // array with cities of current country

    public searchString: String = ''; // input[type='text']

    private data: any;

    private searchHistory = []; // users search history (get from local storage)
    private locationHistory = []; // users location history (get from local storage)

    private serverNotRespond = false; // when server not respond more then 5 seconds

    // when we click on "delete search item" remember his index and delete this element in modal
    private currentDeleteIndex = -1;

    // using for show 'last search' section (if it will =false , app will show 'last location' section)
    private showSearch = true;
    private showHistory = true;

    private mainSpinner = true; // visible while page not load

    constructor(private mainService: MainService,
                private appService: AppService,
                private preloader: PreloaderService) {}

    ngOnInit() {
        // Init array of countries
        let savedCountry = localStorage.getItem('country');
        if (savedCountry) {
            this.currentCountry = JSON.parse(savedCountry);
        } else {
             this.currentCountry = {'name': 'UK', 'lang': 'en', 'country': 'uk', 'server': 'https://api.nestoria.co.uk'};
        }
        this.mainService.getCountries().subscribe((data) => {
            this.countriesArray = data;
           // this.mainSpinner = false;
           this.preloader.setMainPreloader(false);
        });

        // Init array with cities of current country
        let savedCities = localStorage.getItem('cities');
        if (savedCities) {
            this.citiesOfCounry = JSON.parse(savedCities);
        }
        this.mainService.getCities().subscribe((data) => {
            this.allCities = data;
            this.citiesOfCounry = data[this.currentCountry['name']];
        });

        // Init search history
        this.initSearchHistory();
        this.initLocationHistory();
    }


    private changeCountry(index: number) {
        this.mainSpinner = true;

        setTimeout(() => {
            if (this.countriesArray[index]) {
                this.currentCountry = this.countriesArray[index];
                this.citiesOfCounry = this.allCities[this.currentCountry['name']];

                localStorage.setItem('country', JSON.stringify(this.currentCountry));
                localStorage.setItem('cities', JSON.stringify(this.citiesOfCounry));
            }
             this.mainSpinner = false;
        }, 10);
    }

    private isContainPhrase(city: string, phrase: string) {
        return (city.toUpperCase().search(phrase.toUpperCase()) > 0);
    }
    private changeHistorySection() {
        this.showHistory = !this.showHistory;
    }
    // ======================================== Search (botton 'Go') ========================================
    private submit() {
        if (this.searchString) {
            this.mainService.sendRequest(this.currentCountry['server']).subscribe(data => {this.data = data; console.log(data); });

            this.searchHistory.push({
                'value': this.searchString,
                'currentServer': this.currentCountry['server']}
            );

            this.rewriteSearchHistory();
            this.searchString = '';

        }
    }

    private rewriteSearchHistory() {
        localStorage.removeItem('searchHistory');
        localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
    }

    private deleteHistoryItem(id: number, fromSearch) {
        if (fromSearch) {
            this.searchHistory.splice(this.searchHistory.length - id - 1, 1);
            this.rewriteSearchHistory();
        } else {
            this.locationHistory.splice(this.locationHistory.length - id - 1, 1);
            this.rewriteLocationHistory();
        }
    }

    private initSearchHistory() {
        let storageItem = JSON.parse(localStorage.getItem('searchHistory'));
        if (storageItem) {
            this.searchHistory = storageItem;
        } else {
            this.searchHistory = [];
        }
    }
    // ========================================  Geolocation (button 'My location') ========================================
    private getCurrentCoordinates() {
        let coordinates =  this.appService.getCurrentCoordinates();

        this.searchString = coordinates['latitude'] + ', ' + coordinates['longitude'];

        this.locationHistory.push({'latitude': coordinates['latitude'], 'longitude': coordinates['longitude']});
        this.rewriteLocationHistory();
    }

    private initLocationHistory() {
        let storageItem = localStorage.getItem('locationHistory');
        if (storageItem) {
            this.locationHistory = JSON.parse(storageItem);
        } else {
            this.locationHistory = [];
        }
    }
    private rewriteLocationHistory() {
        localStorage.removeItem('locationHistory');
        localStorage.setItem('locationHistory', JSON.stringify(this.locationHistory));
    }
}
