import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { HeaderService } from './header.service';
import { PreloaderService } from '../preloader.service';

@Component({
    moduleId: module.id,
    selector: 'app-header',
    templateUrl: 'header.component.html',
    styleUrls: ['header.component.scss'],
    providers: [HeaderService]
})
export class HeaderComponent implements OnInit {
    private searchString: String = '';
    private allCountries: Array<Object> = [];
    private currentCountry: Object;
    private citiesOfCountry: Array<string> = [];

    constructor(private headerService: HeaderService,
                private preloader: PreloaderService) { }

    ngOnInit() {
        // Init country (from local storage or from files)
        let savedCountry = localStorage.getItem('country');
        if (savedCountry) {
            this.currentCountry = JSON.parse(savedCountry);
        } else {
            this.headerService.getCountries().subscribe((data) => {
                this.currentCountry = data.filter((country) => {
                        return country['name'] === 'UK' || country['name'] === 'United Kingdom';
                })[0];
            })
        }

        this.headerService.getCountries().subscribe((data) => {
             this.allCountries = data;
            // this.setPreloader(false);
        });

        // Init cities (from local storage or from file)
        this.citiesOfCountry = JSON.parse(localStorage.getItem('cities'));
        if (!this.citiesOfCountry) {
            this.headerService.getCitiesByCountry(this.currentCountry['name']).subscribe((data) => {
                this.citiesOfCountry = data;
            });
        }
    }

    private changeCountry(position: number) {
        let country = this.allCountries[position];
        if (country) {
            this.preloader.setMainPreloader(true);
            this.currentCountry = country;
            localStorage.setItem('country', JSON.stringify(country));

            this.headerService.getCitiesByCountry(country['name']).subscribe((data) => {
                this.citiesOfCountry = data;
                localStorage.setItem('cities', JSON.stringify(this.citiesOfCountry));
            this.preloader.setMainPreloader(false);
            })
        }
    }

    private isContainPhrase(city, phrase) {
        return (city.toLowerCase().search(phrase.toLowerCase()) >= 0);
    }
    private clearSearch() {
        this.searchString = '';
    }
}
