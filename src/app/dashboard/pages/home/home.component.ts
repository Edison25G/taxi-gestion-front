import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators'; // ✅ Importante para manejo de estado

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api'; // ✅ Para notificaciones de error

// Servicios y Modelos
import { AuthService } from '../../../core/services/auth.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { RolUsuario } from '../../../core/models/role.enum';

// Interfaz local para los datos del reporte (Mejor que usar 'any')
interface DashboardStats {
	viajesRealizados: number;
	conductoresActivos: number;
	gananciasDia: number;
	calificacion: number;
}

@Component({
	selector: 'amc-home',
	standalone: true,
	imports: [CommonModule, RouterModule, CardModule, SkeletonModule, ChartModule, ButtonModule],
	providers: [MessageService], // Proveedor local para mensajes
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
	// Inyecciones
	public authService = inject(AuthService);
	private usuarioService = inject(UsuarioService);
	private messageService = inject(MessageService);

	// Estado del Usuario
	userRole: RolUsuario | null = null;
	Role = RolUsuario; // Para usar en el HTML

	// Control de estado visual
	isLoading = true;
	isEmpty = false;

	// Datos del reporte inicializados en 0
	reporteData: DashboardStats = {
		viajesRealizados: 124,
		conductoresActivos: 15,
		gananciasDia: 450.0,
		calificacion: 4.8,
	};

	// Configuración del Gráfico
	barChartData: any;
	barChartOptions: any;

	ngOnInit(): void {
		// Normalizar el rol del backend al enum
		const roleString = this.authService.getRole();
		if (roleString) {
			const roleUpper = roleString.toUpperCase();
			if (roleUpper === 'ADMINISTRADOR' || roleUpper === 'ADMIN') {
				this.userRole = RolUsuario.ADMIN;
			} else if (roleUpper === 'CLIENTE') {
				this.userRole = RolUsuario.CLIENTE;
			} else if (roleUpper === 'CONDUCTOR') {
				this.userRole = RolUsuario.CONDUCTOR;
			} else {
				this.userRole = null;
			}
		}

		// Iniciamos configuración visual
		this.initChart();

		// Carga de datos
		this.loadDashboardData();
	}

	loadDashboardData() {
		this.isLoading = true;

		// Si no es ADMIN, no cargamos estadísticas globales (por ahora)
		if (this.userRole !== RolUsuario.ADMIN) {
			this.isLoading = false;
			// Aquí podrías cargar datos específicos de Cliente/Conductor
			return;
		}

		// Si es ADMIN, procedemos con la carga global
		this.usuarioService
			.getUsuarios()
			.pipe(
				// ✅ finalize se ejecuta SIEMPRE (éxito o error)
				finalize(() => {
					this.isLoading = false;
				}),
			)
			.subscribe({
				next: (socios) => {
					const totalSocios = socios.length;

					if (totalSocios === 0) {
						this.isEmpty = true;
					} else {
						this.isEmpty = false;
						// Actualizamos solo los datos reales (simulados por ahora para demo visual)
						this.reporteData.viajesRealizados = 124;
						this.reporteData.conductoresActivos = totalSocios > 0 ? 15 : 0; // Mock logic based on users
					}
				},
				error: (err) => {
					console.error('Error dashboard:', err);

					// Opcional: Mostrar mensaje al usuario si la API falla
					// this.messageService.add({severity:'error', summary:'Error', detail:'No se pudieron cargar los datos'});
				},
			});
	}

	// Configuración del gráfico (Estética)
	private initChart() {
		const documentStyle = getComputedStyle(document.documentElement);
		const textColor = documentStyle.getPropertyValue('--text-color');
		const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
		const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

		this.barChartData = {
			labels: ['Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene'],
			datasets: [
				{
					label: 'Solicitudes',
					data: [65, 59, 80, 81, 56, 124],
					backgroundColor: '#f59e0b', // Tailwind Amber-500
					borderRadius: 6,
				},
			],
		};

		this.barChartOptions = {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: { labels: { color: textColor } },
			},
			scales: {
				y: {
					beginAtZero: true,
					grid: { color: surfaceBorder, drawBorder: false },
					ticks: { color: textColorSecondary },
				},
				x: {
					grid: { color: surfaceBorder, drawBorder: false },
					ticks: { color: textColorSecondary },
				},
			},
		};
	}
}
