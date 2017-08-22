import { Component, OnInit} from '@angular/core';

@Component({
    moduleId: module.id,
    selector: 'app-favorite',
    templateUrl: 'favorite.component.html',
    styleUrls: ['favorite.component.scss']
})
export class FavoriteComponent implements OnInit {
    private favorites: Array<Object>;
    private linksArray: Array<string>;
    private currentItem: Object;
    private deleteItemNumber = -1;

    ngOnInit() {

        let favorites = JSON.parse(localStorage.getItem('favorites'));
        (favorites) ? this.favorites = favorites : this.favorites = [];

        let links = JSON.parse(localStorage.getItem('favorites_links'));
        (links) ? this.linksArray = links : this.linksArray = [];


        this.currentItem = { };
    }

    // clear all
    private clearFavorites() {
        this.favorites = [];
        this.linksArray = [];

        localStorage.removeItem('favorites');
        localStorage.removeItem('favorites_links');
    }

    // delete item
    private deleteFromFavorite(index: number) {
        this.linksArray.splice(index, 1);
        localStorage.setItem('favorites_links', JSON.stringify(this.linksArray));

        this.favorites.splice(index, 1);
        localStorage.setItem('favorites',  JSON.stringify(this.favorites));
    }

    // is contain item
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

    private setCurrentItem(object: Object) {
        this.currentItem = object;
    }

    private saveDeleteNumber(num: number) {
        this.deleteItemNumber = num;
    }
}
