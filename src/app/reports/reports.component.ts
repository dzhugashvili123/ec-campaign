import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { PartyService } from '../party.service';
import { EcCampaignService } from '../services/ec-campaign.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../environments/environment';
import * as XLSX from 'xlsx';

@Component({
    selector: 'app-reports',
    templateUrl: './reports.component.html',
    styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
    startDate: string = '';
    endDate: string = '';
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
        // Initialize date range to current month
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        this.startDate = firstDay.toISOString().split('T')[0];
        this.endDate = now.toISOString().split('T')[0];

        this.isLoggedIn = this.campaignService.isLoggedIn();
    }

    get assetPath() {
        return `assets/${this.party.current}`;
    }

    onSubmit() {
        if (!this.startDate || !this.endDate) {
            this.toastr.warning('Please select a date range');
            return;
        }
        const client = this.party.selectedClient;
        const templateId = client?.clientMeta?.videoTemplateId;

        if (!templateId) {
            this.toastr.error('No video template ID found for the current party');
            return;
        }

        this.isLoading = true;
        const url = `${environment.videoApiUrl}/reports/reportByFields?startDate=${this.startDate}&endDate=${this.endDate}&templateId=${templateId}`;

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

    downloadReport() {
        if (!this.reportData || this.reportData.length === 0) {
            this.toastr.warning('No data to download');
            return;
        }

        const clientName = this.party.selectedClient?.name || 'Client';
        const fileName = `${clientName}_Visit_Report_${this.startDate}_to_${this.endDate}.xlsx`;

        // Map data to user-friendly headers
        const exportData = this.reportData.map(row => ({
            'Mobile Number': row.policyNumber,
            'Visit Date': row.visitDate,
            'Visit Count': row.visitCount
        }));

        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Report');

        XLSX.writeFile(wb, fileName);
        this.toastr.success('Report downloaded successfully!');
    }
}
