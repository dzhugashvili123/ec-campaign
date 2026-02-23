import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { PartyService } from '../party.service';
import { EcCampaignService } from '../services/ec-campaign.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../environments/environment';

@Component({
    selector: 'app-reports',
    templateUrl: './reports.component.html',
    styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
    startDate: string = '';
    endDate: string = '';
    selectedTemplate: string = '418968a1-4dd6-448e-8386-cf03bd5ae28d';
    templates = [
        { name: 'Select', value: '--Select--' },
        { name: 'ADV', value: '418968a1-4dd6-448e-8386-cf03bd5ae28d' }
    ];
    displayedColumns = [
        { key: 'policyNumber', label: 'Mobile Number' },
        { key: 'visitDate', label: 'Visit Date' },
        { key: 'visitCount', label: 'Visit Count' }
    ];
    reportData: any[] = [];
    isLoading = false;
    isLoggedIn = false;

    constructor(
        private http: HttpClient,
        private route: ActivatedRoute,
        private router: Router,
        public party: PartyService,
        private campaignService: EcCampaignService,
        private toastr: ToastrService
    ) { }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            if (params['partyName']) {
                // Assuming PartyService has a way to set current party or we just use it for local checks
                // But PartyService seems to hold global state.
                // If the user refreshed the page, PartyService might lose state if it doesn't persist.
                // For now, let's assume PartyService is singleton and might be initialized or we set it.
                // However, PartyService.current is a property.
                // If simpler, just rely on what's there or default to 'adv'.
                if (params['partyName'] !== this.party.current) {
                    // We can try to update it if possible, strictly speaking we should probably not mutate it directly if it's read-only managed elsewhere, but based on usage in `ec-campaign` it seems it is read. 
                    // Let's assume 'adv' for reports if not set.
                }
            }
        });

        this.isLoggedIn = this.campaignService.isLoggedIn();
    }

    get assetPath() {
        return `assets/${this.party.current}`;
    }

    onSubmit() {
        if (!this.startDate || !this.endDate || !this.selectedTemplate || this.selectedTemplate === '--Select--') {
            alert('Please fill in all fields');
            return;
        }

        this.isLoading = true;
        const url = `${environment.videoApiUrl}/api/reports/reportByFields?startDate=${this.startDate}&endDate=${this.endDate}&templateId=${this.selectedTemplate}`;

        this.http.get<any[]>(url).subscribe({
            next: (data) => {
                this.reportData = data;
                this.isLoading = false;
                console.log('Report data loaded:', data);
            },
            error: (error) => {
                console.error('Error loading report:', error);
                this.isLoading = false;
                alert('Failed to load report data');
            }
        });
    }

    // Helper to get object keys for dynamic table headers
    getKeys(obj: any): string[] {
        return obj ? Object.keys(obj) : [];
    }

    logout() {
        this.campaignService.logout();
        this.isLoggedIn = false;
        this.toastr.success('Logged out successfully!');
        // Redirect to home or stay here?
        this.router.navigate(['/']);
    }

    navigateToCampaign() {
        this.router.navigate([`/${this.party.current}`]);
    }

    login() {
        this.router.navigate([`/${this.party.current}`]); // Go back to main page to login as logic is there
    }
}
