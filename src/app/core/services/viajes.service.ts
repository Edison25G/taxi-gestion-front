import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Viaje } from '../models/viaje.model';
import { environment } from '../../environments/environment';
import { DriverAssignmentStrategy } from '../domain/strategies/assignment.strategy';
import { SimpleAssignmentStrategy } from '../infrastructure/strategies/simple-assignment.strategy'; // O la abstracta si se provee en root

@Injectable({
	providedIn: 'root',
})
export class ViajesService {
	private http = inject(HttpClient);
	// Inyectamos la Estrategia Concreta (o el Token si se configuró en app.config)
	// Para simplificar y que funcione directo:
	private strategy: DriverAssignmentStrategy = inject(SimpleAssignmentStrategy);
	// private apiUrl = environment.apiUrl + '/viajes'; // Uncomment when backend is ready

	constructor() {}

	getViajes(): Observable<Viaje[]> {
		const url = `${environment.apiUrl}/viajes/`;
		return this.http.get<Viaje[]>(url);
	}

	createViaje(viaje: Viaje): Observable<Viaje> {
		// Mock implementation
		console.log('Solicitando viaje...', viaje);
		// Aqui delegamos la logica de "asignacion" a la estrategia si quisieramos
		// pero primero creemos el viaje en BD (simulado)
		return of({ ...viaje, id: Math.floor(Math.random() * 1000) });
	}

	// Método REAL para conectar con el backend
	solicitarTaxi(request: {
		cliente_id: number;
		lat_origen: number;
		lon_origen: number;
		lat_destino: number;
		lon_destino: number;
		origen?: string;
		destino?: string;
	}): Observable<any> {
		const url = `${environment.apiUrl}/viajes/solicitar/`;
		return this.http.post(url, request);
	}
}
