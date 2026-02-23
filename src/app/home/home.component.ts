import { Component, OnInit } from '@angular/core';
import { EcCampaignService } from '../services/ec-campaign.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PartyService } from '../party.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  clients: any[] = [];
  isLoading = true;

  constructor(
    private campaignService: EcCampaignService,
    private router: Router,
    private toastr: ToastrService,
    private party: PartyService
  ) { }

  ngOnInit() {
    this.fetchClients();
  }

  fetchClients() {
    this.campaignService.getClients().subscribe({
      next: (response) => {
        if (response && response.success && response.data) {
          this.clients = response.data;
          this.isLoading = false;
        } else {
          this.toastr.error('No clients found');
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Error fetching clients:', err);
        this.toastr.error('Failed to fetch clients');
        this.isLoading = false;
      }
    });
  }

  selectClient(client: any) {
    // Save selected client ID
    if (client.id) {
      this.campaignService.setSelectedClientId(client.id);
    }

    // Set client in PartyService for theme and assets
    this.party.setClient(client);

    // Navigate to the client's route
    const clientRoute = client.clientMeta?.code || client.code?.toLowerCase() || client.name?.toLowerCase();
    if (clientRoute) {
      this.router.navigate([`/${clientRoute}`]);
    }
  }
}
