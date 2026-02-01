import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule for pipes like date and currency
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
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

	ngOnInit() {
		// Mock Data actualizado según requerimiento
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
