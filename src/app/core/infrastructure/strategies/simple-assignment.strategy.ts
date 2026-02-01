import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { DriverAssignmentStrategy } from '../../domain/strategies/assignment.strategy';
import { Viaje } from '../../models/viaje.model';
import { Conductor } from '../../domain/models/conductor.model';

@Injectable({
	providedIn: 'root', // Default strategy
})
export class SimpleAssignmentStrategy implements DriverAssignmentStrategy {
	findDriver(trip: Viaje): Observable<Conductor> {
		console.log(`Buscando conductor para viaje de ${trip.origen} a ${trip.destino}...`);

		// Mock Conductor
		const mockDriver: Conductor = {
			id: 501,
			username: 'chofer_juan',
			first_name: 'Juan',
			last_name: 'Pérez',
			email: 'juan@taxi.com',
			rol: 'CONDUCTOR',
			placa: 'PBA-1234',
			modeloAuto: 'Chevrolet Aveo',
			licencia: 'Tipo C',
			calificacion: 4.8,
		};

		// Simula demora en la red/búsqueda (2 segundos)
		return of(mockDriver).pipe(delay(2000));
	}
}
