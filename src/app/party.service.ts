import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class PartyService {

  private currentClient: any = null;
  current: string = 'adv'; // Added for compatibility, initialized to 'adv' as per new logic

  defaultTheme = {
    color: '#F07965',
    text: '#000000',
    joinUrl: "",
    donateUrl: "",
    joinLabel: 'VOTE FOR ME'
  };

  constructor(private router: Router) {
    this.loadClientFromStorage();
  }

  loadClientFromStorage() {
    const storedClient = sessionStorage.getItem('selectedClient');
    if (storedClient) {
      try {
        this.currentClient = JSON.parse(storedClient);
        this.current = this.currentClient.clientMeta?.code || 'adv';
      } catch (e) {
        console.error('Error parsing stored client', e);
      }
    }
  }

  setClient(client: any) {
    this.currentClient = client;
    sessionStorage.setItem('selectedClient', JSON.stringify(client));
    this.current = client.clientMeta?.code || 'adv';
  }

  setParty(partyCode: string) {
    if (partyCode) {
      this.current = partyCode.toLowerCase();
    }
  }

  setFromUrl(url: string) {
    let p = url.split('/')[1];

    // clean up path segment if it has query params attached
    if (p && p.includes('?')) {
      p = p.split('?')[0];
    }

    // Check if path is valid party, if not check query param 'name'
    if (p !== 'bjp' && p !== 'tdp' && p !== 'adv') {
      const match = url.match(/[?&]name=([^&]+)/);
      if (match) {
        p = match[1];
      }
    }

    if (p === 'bjp' || p === 'tdp' || p === 'adv') {
      this.current = p;
    } else {
      this.current = 'tdp';
    }
  }

  get theme() {
    if (!this.currentClient || !this.currentClient.clientMeta) {
      return this.defaultTheme;
    }
    const meta = this.currentClient.clientMeta;
    return {
      color: meta.color || this.defaultTheme.color,
      text: meta.text || this.defaultTheme.text,
      joinUrl: meta.joinUrl || '',
      donateUrl: meta.donationUrl || '',
      joinLabel: meta.joinLabel || this.defaultTheme.joinLabel
    };
  }
}
