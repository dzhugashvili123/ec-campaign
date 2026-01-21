import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PartyService } from './party.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ec-campaign';
  constructor(private router: Router, private party: PartyService) {
  this.router.events.subscribe(() => {
    this.party.setFromUrl(this.router.url);
  });
}
}
