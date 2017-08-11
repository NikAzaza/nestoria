// Angular Imports
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

// This Module's Components
import { MainComponent } from './main.component';

@NgModule({
    imports: [
        BrowserModule
    ],
    declarations: [
        MainComponent,
    ],
    exports: [
        MainComponent,
    ]
})
export class MainModule {

}
