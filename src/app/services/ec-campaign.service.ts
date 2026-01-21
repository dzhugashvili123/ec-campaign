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
	lastView: string | null = null;
	constructor(private http: HttpClient) { }

	processCampaign(payload: { fileName: string; campaignName: string }): Observable<any> {
		return this.http.post<any>(`${this.baseUrl}/process-campaign`, payload);
	}

	uploadFile(file: File): Observable<any> {
		const formData = new FormData();
		formData.append('file', file, file.name);
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
