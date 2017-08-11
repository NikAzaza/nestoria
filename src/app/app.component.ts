import { Component, OnInit } from '@angular/core';
import { PreloaderService } from './preloader.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private mainSpinner = true;

  constructor(private preloader: PreloaderService) { }

  ngOnInit() {
    this.preloader.mainSpinnerSubject.subscribe((spinnerState) => {
      this.mainSpinner = spinnerState;
    });
  }
}
