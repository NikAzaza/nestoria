import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params, NavigationEnd, RouterLink } from '@angular/router';
import { Http, Jsonp, URLSearchParams  } from '@angular/http';

import { PreloaderService } from '../preloader.service';
import { AppService } from '../app.service';


@Component({
    moduleId: module.id,
    selector: 'app-filter',
    templateUrl: 'filter.component.html',
    styleUrls: ['filter.component.scss']
})
export class FilterComponent implements OnInit {
    // respond from server
    private products: Array<Object> = [];
    private numOfResults = 0;
    private currentPage = 1;
    private numOfPages = 0;
    private serverNotRespond = false;

    // toggle filter panel
    private isVisibleFilters = true;

    // sorting parameters (value - to query, name - to translate service)
    private sort = [
        {value: 'relevancy', name: 'filter-sort1'},
        {value: 'bedroom_lowhigh', name: 'filter-sort2'},
        {value: 'bedroom_highlow', name: 'filter-sort3'},
        {value: 'price_lowhigh', name: 'filter-sort4'},
        {value: 'price_highlow', name: 'filter-sort5'},
        {value: 'newest', name: 'filter-sort6'},
        {value: 'oldest', name: 'filter-sort7'},
        {value: 'random', name: 'filter-sort8'},
        {value: 'distance', name: 'filter-sort9'},
    ];

    // object with query params
    private filter: Object = {};

    // for price slider
    private price_max: number = 1000;
    private price_step: number = 1;

    private basicParam = {};
    private basicQueryParam = {};
    private testArray = [];
    private countryCode: string;
    private linksArray: Array<string>;
    constructor (private preloader: PreloaderService,
                private appService: AppService,
                private router: Router,
                private activatedRoute: ActivatedRoute,
                private jsonp: Jsonp) {
                     this.countryCode = this.appService.currentCountry['country'];
                }
    ngOnInit() {
        this.initNewPlace();

        this.appService.changePlaceSubject.subscribe((data) => {
            if (data) {
                 this.filter = {
                    listing_type: false,
                    price_min: null,
                    price_max: null,
                    size_min: null,
                    size_max: null,
                    property_type: null,
                    bedroom: [],
                    room: [],
                    bathroom: [],
                    has_photo: false,
                    number_of_results: false,
                    sort: '',
                    page: 1
                };
                let paramFromMain = this.activatedRoute.snapshot.params['place'];
                let parameterName;
                (paramFromMain.indexOf(',') > 0) ? parameterName = 'centre_point' : parameterName = 'place_name';
                this.filter[parameterName] = paramFromMain;
                this.filterChange(false, false);
            }
        });
    }


    private initNewPlace() {
        this.defaultFilter(false, false);

        // init parameters from mainComponent
        let paramFromMain = this.activatedRoute.snapshot.params['place'];
        let parameterName;

        (paramFromMain.indexOf(',') > 0) ? parameterName = 'centre_point' : parameterName = 'place_name';
        this.basicParam[parameterName] =  paramFromMain;
        this.basicQueryParam = this.activatedRoute.snapshot.queryParams;

        for (let propertyName in this.basicQueryParam) {
            if (this.basicQueryParam.hasOwnProperty(propertyName)) {
                let property = this.basicQueryParam[propertyName];

                switch (propertyName) {
                    case 'bedroom_min':
                        this.filter['bedroom'][property] = true;
                    break;
                    case 'bedroom_max':
                        this.filter['bedroom'][property] = true;
                    break;
                    case 'room_min':
                        this.filter['room'][property] = true;
                    break;
                    case 'room_max':
                        this.filter['room'][property] = true;
                    break;
                    case 'bathroom_min':
                        this.filter['bathroom'][property] = true;
                    break;
                    case 'bathroom_max':
                        this.filter['bathroom'][property] = true;
                    break;
                    case 'listing_type':
                        (property === 'buy') ? this.filter['listing_type'] = false : this.filter['listing_type'] = true;
                    break;
                     case 'number_of_results':
                        (property === '20') ? this.filter['number_of_results'] = false : this.filter['number_of_results'] = true;
                    break;
                    default:
                    this.filter[propertyName] = property;
                        break;
                }

            }
        }

        // init filter by parameters from query param
        this.filterChange(false, false);

        let links = JSON.parse(localStorage.getItem('favorites_links'));
        (links) ? this.linksArray = links : this.linksArray = [];
    }

    private hideFilterSection() {
        this.isVisibleFilters = !this.isVisibleFilters;
    }

    // ============================ method's for slider ============================
    private increasePrice() {
        if (this.price_max < 999999999) {
            this.price_max *= 10;
            this.price_step *= 10;
        }
    }
    private decreasePrice() {
         if (this.price_max > 1000) {
            this.price_max /= 10;
            this.price_step /= 10;
        }
    }
    private priceChange(event) {
        this.filter['price_min'] = event['from'];
        this.filter['price_max'] = event['to'];

        this.filterChange(false, false);
    }

    private sizeChange(event) {
        this.filter['size_min'] = event['from'];
        this.filter['size_max'] = event['to'];
         this.filterChange(false, false);
    }

    // ============================== method's for filter ============================
    /**
    *  if 'ignoreHistory' == true then don't add result of search in search history
    * if 'savePage' == true then watch results from currentPage. Else from 1st page
    **/
    private defaultFilter(ignoreHistory, savePage) {
        // defult filter object
        this.filter = {
            listing_type: false,
            price_min: null,
            price_max: null,
            size_min: null,
            size_max: null,
            property_type: null,
            bedroom: [],
            room: [],
            bathroom: [],
            has_photo: false,
            number_of_results: false,
            sort: '',
            page: 1
        };
        // add query parameters which were received from mainComponent
        for (let key in this.basicParam) {
            if (this.basicParam.hasOwnProperty(key)) {
                let parameter = this.basicParam[key];
                console.log(this.basicParam);
                this.filter[key] = parameter;
            }
        }
    }

    private clearFilter() {
        this.defaultFilter(true, false);
        this.filterChange(true, false);
    }

   // if 'ignoreHistory' == true then don't add result of search in search history
    private filterChange(ignoreHistory, savePage) {
        if (!savePage) {
            this.filter['page'] = 1;
        }

        setTimeout(() => {
            this.preloader.startMainPreloader();
        }, 500);

        this.serverNotRespond = false;
        this.products = null;

        // if don't get data more than 15 seconds
        let respondTimer = setTimeout(() => {
            if (this.products === null) {
                this.serverNotRespond = true;
              this.preloader.closeMainPreloader();
            }
        }, 15000);

        this.appService.server(this.appService.currentCountry, this.filter).subscribe((response: Object) => {
            this.preloader.startMainPreloader();
            console.log(response);
            this.numOfResults = response['response']['total_results'];
            this.currentPage = response['response']['page'];
            this.numOfPages = response['response']['total_pages'];
            this.products = response['response']['listings'];

            setTimeout(() => {
                 this.preloader.closeMainPreloader();
                 this.serverNotRespond = false;
            }, 1000);

            clearTimeout(respondTimer);

            // if it's not 'clear filter' or 'pagination' click. We need to add result in history
            if (!ignoreHistory) {

            // get parameters from filter and add to history item
            let paramName;
            let locationParameter;
                for (let key in this.basicParam) {
                    if (this.basicParam.hasOwnProperty(key)) {
                        locationParameter = this.basicParam[key];
                        paramName = key;
                    }
                }

                let obj = new URLSearchParams();

                obj.set('country', this.countryCode['country']);
                obj.set('action', 'search_listings');
                obj.set('encoding', 'json');
                obj.set('callback', 'JSONP_CALLBACK');

                obj = this.appService.convertObjectToParams(obj, this.filter);
                let queryParamObj = {};
                obj.paramsMap.forEach((element, index) => {
                    queryParamObj[index] = element[0];
                });

                switch (paramName) {
                    case 'centre_point':
                        this.addLocationHistoryItem(this.appService.currentCountry, locationParameter, queryParamObj);
                        break;
                    case 'place_name':
                        this.addSearchHistoryItem(this.appService.currentCountry, locationParameter,
                                    this.numOfResults, queryParamObj);
                        break;
                }

            }
        });
    }

    // add search results in local storage
    private addSearchHistoryItem(currentCountry: Object, place: string, resultsOfSearch: number, queryParam: Object) {
        let currHistory = JSON.parse(localStorage.getItem('searchHistory'));

        if (!currHistory) {
            currHistory = [];
        }

        currHistory.push({
            'value': place,
            'currentCountry': currentCountry,
            'results': resultsOfSearch,
            'parameters': queryParam
        });

        this.appService.rewriteSearchHistory(currHistory);
    }
    // add location in location history array
    private addLocationHistoryItem(currentCountry: Object, coordinates: string, queryParam: Object) {
        let currHistory = JSON.parse(localStorage.getItem('locationHistory'));

        if (!currHistory) {
            currHistory = [];
        }
        let newHistoryItem = {
            'coords': coordinates,
            'country': currentCountry,
            'value': coordinates.slice(0, 5) + ', ' +
                coordinates.slice(coordinates.indexOf(',') + 1, coordinates.indexOf(',') + 6),
            'parameters': queryParam
            };

        currHistory.push(newHistoryItem);
        this.appService.rewriteLocationHistory(currHistory);

    }

    private setPage(number) {
        this.filter['page'] = number;
        this.currentPage = number;
        this.filterChange(true, true);

    }

    private addToFavorite(index: number) {
        let item = this.products[index];

        let favoriteArray = JSON.parse(localStorage.getItem('favorites'));
        if (!favoriteArray) {
            favoriteArray = [];
        }
        favoriteArray.push(item);
        localStorage.setItem('favorites', JSON.stringify(favoriteArray));


        this.linksArray.push(item['lister_url']);
        localStorage.setItem('favorites_links', JSON.stringify(this.linksArray));
    }

    private deleteFromfavorite(index: number) {
        let item = this.products[index];
        let link = item['lister_url'];

        // find in array links
        let indexInArray = this.linksArray.findIndex((element) => {
            return link === element
        });
        this.linksArray.splice(indexInArray, 1);
        localStorage.setItem('favorites_links', JSON.stringify(this.linksArray));


        let favoriteArray = JSON.parse(localStorage.getItem('favorites'));
        if (!favoriteArray) {
            favoriteArray = [];
        } else {
            // find in array
            favoriteArray.splice(indexInArray, 1);
            localStorage.setItem('favorites',  JSON.stringify(favoriteArray));
        }
    }

    private isInFavorite(link: string) {
        let isContain = false;

            if (this.linksArray) {
                this.linksArray.forEach((element) => {
                if (element === link) {
                    isContain = true;
                }
            });
        }
        return isContain;
    }
}
