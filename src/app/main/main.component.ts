import { Component, OnInit } from '@angular/core';
import { Response, Http} from '@angular/http';
// import { MainService } from './main.service';
import {Subscription} from 'rxjs';
import { AppService } from '../app.service';
import { PreloaderService } from '../preloader.service';
import { Router } from '@angular/router';
import {Location} from '@angular/common';

@Component({
    moduleId: module.id,
    selector: 'app-main',
    templateUrl: 'main.component.html',
    styleUrls: ['main.component.scss'],
    providers: []
})
export class MainComponent implements OnInit {
    private filteredCities: Array<String> = []; // array with filtered cities

    public searchString: String = ''; // input[type='text']
    private rememberedSearch: String = ''; // when (onblur) remember search string and clear her

    private data: any; // Respond from server

    private searchHistory = []; // users search history (get from local storage)
    private locationHistory = []; // users location history (get from local storage)

    // when we click on "delete search item" remember his index and delete this element in modal
    private currentDeleteIndex = -1;

    // using for show 'last search' section (if it will =false , app will show 'last location' section)
    private showSearch = true;
    private showHistory = true;


    constructor(// private mainService: MainService,
                private appService: AppService,
                private preloader: PreloaderService,
                private router: Router,
                private location: Location) {}

    ngOnInit() {
        // Init search history
        this.initSearchHistory();
        this.initLocationHistory();
    }

    private clearSearch() {
        this.searchString = '';
    }

    private clearHints() {
        this.rememberedSearch = this.searchString;
        this.searchString = '';
    }
    private filterCities(phrase: string) {
        if (phrase.length >= 2) {
            this.filteredCities = this.appService.citiesOfCountry.filter((element) => {
                return (element.toLowerCase().includes(phrase.toLowerCase()));
            });
        }
        this.rememberedSearch = this.searchString;
    }
    private changeHistorySection() {
        this.showHistory = !this.showHistory;
    }
    // ======================================== Search (botton 'Go') ========================================
    private submit(place: string) {
        if (this.rememberedSearch) {
            console.log('azaza');
            console.log(this.rememberedSearch);
            this.router.navigate([this.appService.currentCountry['country'], 'filter', this.rememberedSearch],
                {queryParams: {'place_name': this.rememberedSearch}});

            this.rememberedSearch = '';
        }
    }
    // when click on search history list item
    private searchFromHisory(index: number) {
        let currSearch = this.searchHistory[this.searchHistory.length - 1 - index];
        // we need change country, when query is from another country

        // if query was in another country then change country
        if (this.appService.currentCountry['country'] !== currSearch['currentCountry']['country']) {

             // search position of country in array with all countries
            let countryIndex = this.appService.allCountries.findIndex((country) => {
                return country['country'] === currSearch['currentCountry']['country'];
            });

            // if index >=0 then change country
            if (countryIndex) {
                this.appService.changeCountry(countryIndex);
            }
        }

        // rewrite search history (selected query must be set on 1st position on history search)
        this.deleteHistoryItem(index, true);
        this.router.navigate([currSearch['currentCountry']['country'], 'filter', currSearch['value']],
            {queryParams: currSearch['parameters']});
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
    private searchByLocation() {
        let coordinates =  this.appService.getCurrentCoordinates();

        this.router.navigate([this.appService.currentCountry['country'], 'filter',
             coordinates['latitude'] + ',' + coordinates['longitude']],
             {queryParams: {'centre_point': coordinates['latitude'] + ',' + coordinates['longitude']}});
    }

    private searchByHistoryLocation(index: number) {
        let historyItem = this.locationHistory[this.locationHistory.length - index - 1];
        // we need change country, when query is from another country

        // if query was in another country then change country
        if (this.appService.currentCountry['country'] !== historyItem['country']['country']) {

             // search position of country in array with all countries
            let countryIndex = this.appService.allCountries.findIndex((country) => {
                return country['country'] === historyItem['country']['country'];
            });

            // if index >=0 then change country
            if (countryIndex) {
                this.appService.changeCountry(countryIndex);
            }
        }

        // rewrite locations history (selected locations must be set on 1st position on array)
        this.deleteHistoryItem(index, false);
        this.router.navigate([historyItem['country']['country'], 'filter', historyItem['coords']]);
    }

    private initLocationHistory() {
        let storageItem = localStorage.getItem('locationHistory');
        if (storageItem) {
            this.locationHistory = JSON.parse(storageItem);
        } else {
            this.locationHistory = [];
        }
    }

    private deleteHistoryItem(id: number, fromSearch: boolean) {
        // if it is search history
        if (fromSearch) {
            this.searchHistory.splice( this.searchHistory.length - id - 1, 1);
            this.appService.rewriteSearchHistory(this.searchHistory);
        } else { // else if it is location
           this.locationHistory.splice(this.locationHistory.length - id - 1, 1);
            this.appService.rewriteLocationHistory(this.locationHistory);
        }
    }
}
