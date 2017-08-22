import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { PreloaderService } from '../preloader.service';
import { AppService } from '../app.service';
import { Router, ActivatedRoute, Params, NavigationEnd, RouterLink } from '@angular/router';

@Component({
    moduleId: module.id,
    selector: 'app-header',
    templateUrl: 'header.component.html',
    styleUrls: ['header.component.scss'],
    providers: []
})
export class HeaderComponent implements OnInit {
    private searchString = '';
    private rememberedSearch = this.searchString;
    private minLength = 3;

    private filteredCities: Array<string> = [];
    private crumbsArray: Array<Object> = [];

    constructor(private preloader: PreloaderService,
                private appService: AppService,
                private router: Router,
                private activatedRoute: ActivatedRoute) { }

    ngOnInit() {
    }

    private clearSearch() {
        this.rememberedSearch = this.searchString;
        this.searchString = '';
    }

    private filterCities(phrase: string) {
        if (this.searchString.length >= this.minLength) {
            this.filteredCities = this.appService.citiesOfCountry
                .filter((element) => {
                    return element.toLocaleLowerCase().includes(phrase.toLowerCase());
                })
        }
        this.rememberedSearch = this.searchString;
    }

    private submit() {
        if (this.rememberedSearch) {
            console.log('azaza HEADER');
            console.log(this.rememberedSearch);
            this.router.navigate([this.appService.currentCountry['country'], 'filter', this.rememberedSearch],
                {queryParams: {'place_name': this.rememberedSearch}});

            this.rememberedSearch = '';
        }
    }

    private test(place: string) {
        //if filterComp then Subject
        //     else just routerNavigate
        let currPage = this.activatedRoute.snapshot.params['country'];
        let isOnFilter = this.router.url.indexOf('/filter/')

        console.log(place);
        if (isOnFilter > 0) {
            // this.router.navigate([this.appService.currentCountry['country'], 'filter', place],
            //     {queryParams: {}});
            this.router.navigate([this.appService.currentCountry['country'], 'filter', place],
                {queryParams: {'place_name': place}});
             this.appService.changeNewPlace();
        } else {
            this.router.navigate([this.appService.currentCountry['country'], 'filter', place],
                {queryParams: {'place_name': place}});
        }
        this.rememberedSearch = '';
    }
}
