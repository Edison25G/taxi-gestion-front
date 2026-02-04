import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';

import { ViajesService } from '../../../../core/services/viajes.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Conductor } from '../../../../core/domain/models/conductor.model';
import { Viaje } from '../../../../core/models/viaje.model';

@Component({
	selector: 'app-solicitar-viaje',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		CardModule,
		InputTextModule,
		ButtonModule,
		ProgressSpinnerModule,
		ToastModule,
		TagModule,
		DividerModule,
		AvatarModule,
	],
	providers: [MessageService],
	templateUrl: './solicitar-viaje.component.html',
	styles: [
		`
			:host {
				display: block;
				width: 100%;
			}
			.animate-bounce-slow {
				animation: bounce 3s infinite;
			}
		`,
	],
})
export default class SolicitarViajeComponent {
	requestForm: FormGroup;

	isSearching = false;
	driverFound: Conductor | null = null;
	currentTrip: Viaje | null = null;

	private fb = inject(FormBuilder);
	private viajesService = inject(ViajesService);
	private authService = inject(AuthService);
	private messageService = inject(MessageService);
	private router = inject(Router);

	constructor() {
		this.requestForm = this.fb.group({
			origen: ['Parque Central', Validators.required],
			destino: ['', Validators.required],
		});
	}

	setDestino(destino: string) {
		this.requestForm.patchValue({ destino });
	}

	solicitarTaxi() {
		if (this.requestForm.invalid) {
			this.requestForm.markAllAsTouched();
			return;
		}

		const currentUser = this.authService.getCurrentUser();
		if (!currentUser) {
			this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No estás autenticado' });
			return;
		}

		this.isSearching = true;
		this.driverFound = null;
		this.currentTrip = null;

		const { origen, destino } = this.requestForm.value;

		// Función auxiliar para enviar solicitud
		const enviarSolicitud = (lat: number, lon: number) => {
			this.viajesService
				.solicitarTaxi({
					cliente_id: currentUser.id,
					lat_origen: lat,
					lon_origen: lon,
					lat_destino: -2.9001, // Mock Destino (Idealmente geocodificado también)
					lon_destino: -79.01, // Mock Destino
					origen: origen, // ✅ Enviamos texto del input
					destino: destino, // ✅ Enviamos texto del input
				})
				.subscribe({
					next: (response) => {
						this.isSearching = false;

						// Mapeo flexible de la respuesta
						this.currentTrip = response.viaje || {
							origen: this.requestForm.value.origen,
							destino: this.requestForm.value.destino,
							tarifa: response.tarifa_estimada || 0,
							estado: 'SOLICITADO',
						};

						// Si el backend devuelve un objeto conductor, genial.
						// Si devuelve "conductor_nombre", creamos un objeto parcial para que el HTML no falle.
						if (response.conductor) {
							this.driverFound = response.conductor;
						} else if (response.conductor_nombre) {
							// Mapeo manual si el backend devuelve estructura plana
							this.driverFound = {
								id: 0,
								username: 'mock_driver', // Requerido por la interfaz
								email: '',
								// password: '', // Eliminado porque no existe en la interfaz Conductor/UserData
								rol: 'CONDUCTOR',
								nombres: response.conductor_nombre, // Usamos nombres para el template
								apellidos: '',
								calificacion: 5.0, // Default visual
								modeloAuto: 'Taxi', // Default visual
								placa: '---', // Default visual
							};
						} else {
							this.driverFound = null;
						}

						if (this.driverFound) {
							const nombreConductor =
								this.driverFound.nombres || this.driverFound.first_name || response.conductor_nombre;
							this.messageService.add({
								severity: 'success',
								summary: '¡Conductor Asignado!',
								detail: `Tu conductor ${nombreConductor} está en camino.`,
							});
						} else {
							this.messageService.add({
								severity: 'info',
								summary: 'Solicitud Recibida',
								detail: 'No hay conductores disponibles por ahora. Tu solicitud está en espera.',
							});
						}
					},
					error: (err) => {
						this.isSearching = false;
						console.error(err);
						this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo solicitar el viaje.' });
					},
				});
		};

		// Obtener GPS Real
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					enviarSolicitud(position.coords.latitude, position.coords.longitude);
				},
				(error) => {
					console.warn('GPS Cliente falló', error);
					this.messageService.add({
						severity: 'warn',
						summary: 'Ubicación Aproximada',
						detail: 'No se obtuvo GPS. Usando ubicación por defecto.',
					});
					enviarSolicitud(-2.8974, -79.0045); // Fallback Cuenca
				},
			);
		} else {
			enviarSolicitud(-2.8974, -79.0045); // Fallback
		}
	}

	nuevoViaje() {
		this.requestForm.reset({
			origen: 'Parque Central',
			destino: '',
		});
		this.driverFound = null;
		this.currentTrip = null;
	}
}
