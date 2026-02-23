import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
	providedIn: 'root'
})
export class EcCampaignService {
	private baseUrl = environment.apiUrl + '/api';
	csvData: any[] = [];
	selectedData: any[] = [];
	selectedList: string = '';
	selectedCampaign: string = '';
	currentCampaignSchema: any[] = [];
	lastView: string | null = null;
	private selectedClientId: string | null = null;

	constructor(private http: HttpClient) {
		const storedId = sessionStorage.getItem('selectedClientId');
		if (storedId) {
			this.selectedClientId = storedId;
		}
	}

	setSelectedClientId(id: string) {
		this.selectedClientId = id;
		sessionStorage.setItem('selectedClientId', id);
	}

	getSelectedClientId(): string | null {
		return this.selectedClientId || sessionStorage.getItem('selectedClientId');
	}

	processCampaign(payload: { fileName: string; campaignName: string }): Observable<any> {
		return this.http.post<any>(`${this.baseUrl}/process-campaign`, payload);
	}

	downloadSample(campaignName: string): Observable<Blob> {
		return this.http.get(`${this.baseUrl}/download-sample?campaignName=${campaignName}`, {
			responseType: 'blob'
		});
	}

	uploadFile(file: File, campaignName?: string, clientId?: string): Observable<any> {
		const formData = new FormData();
		formData.append('file', file, file.name);
		if (campaignName) formData.append('campaignName', campaignName);
		if (clientId) formData.append('clientId', clientId);
		return this.http.post<any>(`${this.baseUrl}/file-upload`, formData);
	}

	getCampaigns(): Observable<any> {
		return this.http.get(this.baseUrl + '/get-campaigns');
	}

	submitRows(payload: { selectedRows: any[] }): Observable<any> {
		return this.http.post<any>(`${this.baseUrl}/submit-selected-rows`, payload);
	}


	login(identifier: string, password: string): Observable<any> {
		return this.http.post<any>(`${this.baseUrl}/login`, { identifier, password });
	}

	getBjpSelectCampaigns(): Observable<any> {
		return this.http.get(this.baseUrl + '/get-select-campaign-users-bjp');
	}

	getTdpSelectCampaigns(): Observable<any> {
		return this.http.get(this.baseUrl + '/get-select-campaign-users-tdp');
	}

	getAdvSelectCampaigns(): Observable<any> {
		return this.http.get(this.baseUrl + '/get-select-campaign-users-adv');
	}

	getClients(): Observable<any> {
		return this.http.get(this.baseUrl + '/clients/active');
	}

	getSelectCampaigns(party: string, campaignName: string): Observable<any> {
		return this.http.get(`${this.baseUrl}/get-select-campaign-users-${party.toLowerCase()}?campaignName=${campaignName}`);
	}

	getCampaignQueueRecords(campaignName: string, clientId: string): Observable<any> {
		return this.http.get(`${this.baseUrl}/get-campaign-queue-records?campaignName=${campaignName}&clientId=${clientId}`);
	}

	updateUser(party: string, payload: any) {
		return this.http.post(
			`${this.baseUrl}/update-campaign-queue-record`,
			payload
		);
	}

	getCampaignsByClientId(clientId: string): Observable<any> {
		return this.http.get(`${this.baseUrl}/clients/${clientId}/campaigns`);
	}

	getCampaignsBySelectedClient(): Observable<any> {
		const clientId = this.getSelectedClientId();
		if (!clientId) {
			console.error('No client selected');
			throw new Error('No client selected');
		}
		return this.getCampaignsByClientId(clientId);
	}

	// updateCampaignUser(payload: any) {
	// 	return this.http.post(
	// 		this.baseUrl + '/update-campaign-user',
	// 		payload
	// 	);
	// }

	updateBjpUser(payload: any) {
		return this.http.post(
			this.baseUrl + '/update-bjp-user',
			payload
		);
	}

	updateTdpUser(payload: any) {
		return this.http.post(
			this.baseUrl + '/update-tdp-user',
			payload
		);
	}

	getPdfUrl(shortId: string) {
		const url = `${this.baseUrl}/pdf/${shortId}`;
		return url;
	}

	logout() {
		sessionStorage.clear();
	}

	isLoggedIn(): boolean {
		return sessionStorage.getItem('isLoggedIn') === 'true';
	}

	getUsername(): string | null {
		return sessionStorage.getItem('username');
	}

}
