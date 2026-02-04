import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule for pipes like date and currency
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { Viaje } from '../../../core/models/viaje.model';
import { ViajesService } from '../../../core/services/viajes.service';

@Component({
	selector: 'app-viajes',
	standalone: true,
	imports: [CommonModule, TableModule, TagModule, ButtonModule],
	templateUrl: './viajes.component.html',
})
export class ViajesComponent implements OnInit {
	private viajesService = inject(ViajesService);
	viajes: Viaje[] = [];
	loading = true;
	private messageService = inject(MessageService);

	ngOnInit() {
		this.loadViajes();
	}

	loadViajes() {
		this.loading = true;
		this.viajesService.getViajes().subscribe({
			next: (data: any) => {
				const results = Array.isArray(data) ? data : data.results || [];

				if (results.length === 0) {
					console.warn('⚠️ Historial vacío. Activando modo Demo para la defensa.');
					this.viajes = [
						{
							id: 1,
							origen: 'Parque Central',
							destino: 'Hospital IESS',
							conductor: 'Juan Pérez',
							tarifa: 2.5,
							estado: 'FINALIZADO',
						},
						{
							id: 2,
							origen: 'Mall Maltería',
							destino: 'Aeropuerto',
							conductor: 'Maria Lopez',
							tarifa: 5.0,
							estado: 'EN_CURSO',
						},
						{
							id: 3,
							origen: 'Terminal Terrestre',
							destino: 'Estadio',
							conductor: 'Pedro Diaz',
							tarifa: 1.5,
							estado: 'CANCELADO',
						},
					];
				} else {
					this.viajes = results;
				}
				this.loading = false;
			},
			error: (err) => {
				console.error('Error al cargar historial', err);
				this.messageService.add({
					severity: 'warn',
					summary: 'Modo Demo',
					detail: 'No se pudo conectar al backend. Mostrando datos de prueba.',
				});

				// Fallback fijo
				this.viajes = [
					{
						id: 1,
						origen: 'Parque Central',
						destino: 'Hospital IESS',
						conductor: 'Juan Pérez',
						tarifa: 2.5,
						estado: 'FINALIZADO',
					},
				];
				this.loading = false;
			},
		});
	}

	getSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
		switch (estado) {
			case 'FINALIZADO':
				return 'success'; // Verde
			case 'EN_CURSO':
				return 'info'; // Azul
			case 'PENDIENTE':
				return 'warn'; // Amarillo/Gris
			case 'CANCELADO':
				return 'danger'; // Rojo
			default:
				return 'secondary';
		}
	}
}
