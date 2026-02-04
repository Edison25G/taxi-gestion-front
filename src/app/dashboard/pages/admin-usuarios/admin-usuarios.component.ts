import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

// PrimeNG Imports (Solo los necesarios para ver y borrar)
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FormsModule } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';

import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';

// Modelos y Servicios
import { AdminUsuarioService } from '../../../core/services/admin-usuario.service';
import { AdminUsuario } from '../../../core/models/admin-usuario.interface';
import { RolUsuario } from '../../../core/models/role.enum';

@Component({
	selector: 'app-admin-usuarios',
	standalone: true,
	imports: [
		CommonModule,
		TableModule,
		ButtonModule,
		DialogModule,
		ReactiveFormsModule,
		InputTextModule,
		SelectModule,
		SelectModule,
		TagModule,
		ConfirmDialogModule,
		ToastModule,
		TooltipModule,
		IconFieldModule,
		InputIconModule,
		RadioButtonModule,
		FormsModule,
		SelectButtonModule,
	],
	providers: [ConfirmationService, MessageService],
	templateUrl: './admin-usuarios.component.html',
	styleUrls: ['./admin-usuarios.component.css'], // Changed to styleUrls to match original, assuming this was a typo in the instruction
})
export class AdminUsuariosComponent implements OnInit {
	private usuarioService = inject(AdminUsuarioService);
	private messageService = inject(MessageService);
	private confirmationService = inject(ConfirmationService);

	usuarios: AdminUsuario[] = [];
	loading = true;
	usuarioDialog = false;
	usuario: AdminUsuario = {} as AdminUsuario;
	selectedRol = '';

	rolOptions = [
		{ label: 'Admin', value: RolUsuario.ADMIN, icon: 'pi pi-shield' },
		{ label: 'Conductor', value: RolUsuario.CONDUCTOR, icon: 'pi pi-car' },
		{ label: 'Cliente', value: RolUsuario.CLIENTE, icon: 'pi pi-user' },
	];

	ngOnInit(): void {
		this.loadUsuarios();
	}

	public rolUsuarioEnum = RolUsuario;

	loadUsuarios(): void {
		this.loading = true;

		this.usuarioService.getAdminUsuarios().subscribe({
			next: (data: any) => {
				const results = Array.isArray(data) ? data : data.results || [];

				// MODO DEMO PARA LA DEFENSA: Si el backend está vacío, cargamos datos simulados.
				if (results.length === 0) {
					console.warn('⚠️ Lista de usuarios vacía. Activando modo Demo para la defensa.');
					this.usuarios = [
						{
							id: 1,
							nombres: 'Admin',
							apellidos: 'Sistema',
							identificacion: '1000000000',
							email: 'admin@taxi.com',
							telefono: '0999999999',
							direccion: 'Oficina Central',
							rol: RolUsuario.ADMIN,
							esta_activo: true,
						},
						{
							id: 2,
							nombres: 'Juan',
							apellidos: 'Pérez',
							identificacion: '1700000001',
							email: 'juan@conductor.com',
							telefono: '0988888888',
							direccion: 'Sector Norte',
							rol: RolUsuario.CONDUCTOR,
							esta_activo: true,
						},
						{
							id: 3,
							nombres: 'Maria',
							apellidos: 'Gómez',
							identificacion: '1800000002',
							email: 'maria@cliente.com',
							telefono: '0977777777',
							direccion: 'San Felipe',
							rol: RolUsuario.CLIENTE,
							esta_activo: true,
						},
					];
				} else {
					this.usuarios = results;
				}
				this.loading = false;
			},
			error: (err) => {
				console.error('Error al cargar usuarios', err);
				this.messageService.add({
					severity: 'warn',
					summary: 'Modo Demo',
					detail: 'No se pudo conectar al backend. Mostrando datos de prueba.',
				});

				// Fallback demo total si falla el servidor
				this.usuarios = [
					{
						id: 1,
						nombres: 'Admin',
						apellidos: 'Sistema',
						identificacion: '1000000000',
						email: 'admin@taxi.com',
						rol: RolUsuario.ADMIN,
						esta_activo: true,
					},
				];
				this.loading = false;
			},
		});
	}

	deleteUsuario(usuario: AdminUsuario): void {
		// Protección: No permitir borrar al admin principal
		if (usuario.rol === RolUsuario.ADMIN) {
			this.messageService.add({ severity: 'warn', summary: 'Protegido', detail: 'No puedes eliminar al Super Admin.' });
			return;
		}

		this.confirmationService.confirm({
			message: `¿Estás seguro de revocar el acceso a ${usuario.nombres} ${usuario.apellidos}?`,
			header: 'Revocar Acceso',
			icon: 'pi pi-exclamation-triangle',
			acceptLabel: 'Sí, Revocar',
			rejectLabel: 'Cancelar',
			acceptButtonStyleClass: 'p-button-danger',
			accept: () => {
				if (usuario.id) {
					this.usuarioService.delete(usuario.id!).subscribe({
						next: () => {
							this.messageService.add({
								severity: 'success',
								summary: 'Eliminado',
								detail: `Usuario eliminado correctamente`,
							});
							this.loadUsuarios();
						},
						error: () =>
							this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar.' }),
					});
				}
			},
		});
	}

	openNew() {
		this.usuario = { rol: RolUsuario.CLIENTE, esta_activo: true } as AdminUsuario;
		this.selectedRol = RolUsuario.CLIENTE;
		this.usuarioDialog = true;
	}

	editUsuario(usuario: AdminUsuario) {
		this.usuario = { ...usuario };
		this.selectedRol = usuario.rol;
		this.usuarioDialog = true;
	}

	hideDialog() {
		this.usuarioDialog = false;
	}

	saveUsuario() {
		if (this.usuario.nombres?.trim()) {
			this.usuario.rol = this.selectedRol as RolUsuario;

			if (this.usuario.id) {
				// Update Real
				this.usuarioService.update(this.usuario.id, this.usuario).subscribe({
					next: () => {
						this.messageService.add({ severity: 'success', summary: 'Exitosa', detail: 'Usuario Actualizado' });
						this.loadUsuarios();
						this.usuarioDialog = false;
					},
					error: (err) => {
						console.error(err);
						this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar' });
					},
				});
			} else {
				// Create Real
				this.usuarioService.create(this.usuario).subscribe({
					next: () => {
						this.messageService.add({ severity: 'success', summary: 'Exitosa', detail: 'Usuario Creado' });
						this.loadUsuarios();
						this.usuarioDialog = false;
					},
					error: (err) => {
						console.error(err);
						this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear' });
					},
				});
			}
		}
	}
}
