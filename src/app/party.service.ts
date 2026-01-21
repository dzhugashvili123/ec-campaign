import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class PartyService {

  current: 'bjp' | 'tdp' | 'adv' = 'bjp';

  themes = {
    bjp: {
      color: '#ff7a00',
      text: '#ffffff',
      joinUrl: 'https://www.bjp.org/membership',
      donateUrl: 'https://www.bjp.org/donate',
      joinLabel: 'JOIN BJP'
    },
    tdp: {
      color: '#ffd700',
      text: '#2b2b00',
      joinUrl: 'https://telugudesam.org/membership-2024-26/',
      donateUrl: 'https://tdpforandhra.com/',
      joinLabel: 'JOIN TDP'
    },
    adv: {
      color: '#F07965',
      text: '#000000',
      joinUrl: "",
      donateUrl: "",
      joinLabel: 'VOTE FOR ME'
    }
  };

  constructor(private router: Router) {}

  setFromUrl(url: string) {
    const p = url.split('/')[1];

    if (p === 'bjp' || p === 'tdp' || p === 'adv') {
      this.current = p;
    } else {
      this.current = 'tdp';
    }
  }

  get theme() {
    return this.themes[this.current];
  }
}
