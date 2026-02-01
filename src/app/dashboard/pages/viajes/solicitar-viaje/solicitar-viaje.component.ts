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

		this.viajesService.solicitarTaxi(origen, destino, currentUser.id).subscribe({
			next: (response) => {
				this.currentTrip = response.viaje;
				this.driverFound = response.conductor;
				this.isSearching = false;

				// Efecto de sonido o vibración podría ir aquí
				this.messageService.add({
					severity: 'success',
					summary: '¡Conductor Encontrado!',
					detail: 'Tu taxi está en camino.',
				});
			},
			error: (err) => {
				this.isSearching = false;
				console.error(err);
				this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo asignar conductor.' });
			},
		});
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
