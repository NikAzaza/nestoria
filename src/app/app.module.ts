import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule, JsonpModule, Http } from '@angular/http';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Routes, RouterModule, RouterLink } from '@angular/router';

import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';

import { AppComponent } from './app.component';
import { MainComponent } from './main/main.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { FilterComponent } from './filter/filter.component';
import { FavoriteComponent } from './favorite/favorite.component';

import { AppService } from './app.service';
import { PreloaderService } from './preloader.service';

import { IonRangeSliderModule } from 'ng2-ion-range-slider';

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}
const appRoutes: Routes = [
  { path: '', component: MainComponent },
  { path: ':country/filter/:place', component: FilterComponent },
  { path: 'favorites', component: FavoriteComponent},
  // { path: '', redirectTo: '/heroes', pathMatch: 'full'},
   { path: '**', redirectTo: '/'}
];

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    HeaderComponent,
    FooterComponent,
    FilterComponent,
    FavoriteComponent
  ],
  imports: [
    FormsModule, BrowserModule,
    HttpModule, JsonpModule,
    HttpClientModule, TranslateModule,
    TranslateModule.forRoot({
        loader: {
                provide: TranslateLoader,
                useFactory: createTranslateLoader,
                deps: [HttpClient]
            }
    }),
    RouterModule.forRoot(
      appRoutes/*, { enableTracing: true } */// <-- debugging purposes only
    ), IonRangeSliderModule
  ],
  exports: [
  ],
  providers: [AppService, PreloaderService],
  bootstrap: [AppComponent]
})
export class AppModule { }
