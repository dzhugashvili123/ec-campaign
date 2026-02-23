import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { EcCampaignAppComponent } from './ec-campaign/ec-campaign.component';
import { RowDetailsComponent } from './row-details/row-details.component';
import { PdfViewerComponent } from './ec-campaign/pdf-viewer/pdf-viewer.component';
import { ReportsComponent } from './reports/reports.component';

const routes: Routes = [
  { path: '', component: HomeComponent },

  { path: 'reports', component: ReportsComponent },

  { path: ':party', component: EcCampaignAppComponent },

  { path: ':party/row-details', component: RowDetailsComponent },

  { path: ':party/pdf/:shortId', component: PdfViewerComponent },

  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
