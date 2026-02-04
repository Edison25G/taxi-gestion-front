import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardStats {
	viajesRealizados: number;
	conductoresActivos: number;
	calificacion: number;
}

@Injectable({
	providedIn: 'root',
})
export class DashboardService {
	private http = inject(HttpClient);
	private apiUrl = `${environment.apiUrl}/dashboard/stats/`;

	getStats(): Observable<DashboardStats> {
		return this.http.get<DashboardStats>(this.apiUrl);
	}

	getChartData(): Observable<any> {
		// En un caso real, esto vendría del backend
		return this.http.get<any>(`${environment.apiUrl}/dashboard/chart/`);
	}
}
