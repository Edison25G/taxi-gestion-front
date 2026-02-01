import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Viaje } from '../models/viaje.model';
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
		// Mock data for now as per instructions to strictly clean up but keep app running
		return of([
			{
				id: 1,
				origen: 'Parque Central',
				destino: 'Hospital',
				tarifa: 2.5,
				estado: 'FINALIZADO',
				clienteId: 101,
				conductorId: 5,
			},
			{
				id: 2,
				origen: 'Mall del Rio',
				destino: 'Aeropuerto',
				tarifa: 5.0,
				estado: 'EN_CURSO',
				clienteId: 102,
				conductorId: 3,
			},
			{ id: 3, origen: 'Terminal Terrestre', destino: 'Estadio', tarifa: 3.0, estado: 'PENDIENTE', clienteId: 103 },
		]);
	}

	createViaje(viaje: Viaje): Observable<Viaje> {
		// Mock implementation
		console.log('Solicitando viaje...', viaje);
		// Aqui delegamos la logica de "asignacion" a la estrategia si quisieramos
		// pero primero creemos el viaje en BD (simulado)
		return of({ ...viaje, id: Math.floor(Math.random() * 1000) });
	}

	// Nuevo método que usa la estrategia
	solicitarTaxi(origen: string, destino: string, clienteId: number): Observable<any> {
		const nuevoViaje: Viaje = {
			id: Date.now(),
			origen,
			destino,
			tarifa: Number((Math.random() * 5 + 1).toFixed(2)), // Tarifa aleatoria entre 1 y 6
			estado: 'PENDIENTE',
			clienteId,
		};

		// 1. "Creamos" el viaje
		// 2. Usamos la estrategia para buscar conductor
		return new Observable((observer) => {
			// Emitimos evento de "Buscando..."
			this.createViaje(nuevoViaje).subscribe((viajeCreado) => {
				// Llamamos a la estrategia
				this.strategy.findDriver(viajeCreado).subscribe((conductor) => {
					// Asignamos conductor
					viajeCreado.conductorId = conductor.id;
					viajeCreado.estado = 'ASIGNADO';

					// Retornamos todo el paquete
					observer.next({
						viaje: viajeCreado,
						conductor: conductor,
					});
					observer.complete();
				});
			});
		});
	}
}
