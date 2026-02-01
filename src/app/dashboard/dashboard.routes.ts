import { Routes } from '@angular/router';
import { RoleGuard } from '@core/guards/role.guard';
import { RolUsuario } from '@core/models/role.enum';

export default [
	{
		path: '',
		loadComponent: () => import('./layout/dashboard-layout.component').then((m) => m.DashboardLayoutComponent),
		canActivate: [RoleGuard],
		children: [
			{
				path: 'home',
				loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
				data: { roles: [RolUsuario.ADMIN, RolUsuario.CLIENTE, RolUsuario.CONDUCTOR] },
			},
			{
				path: 'usuarios',
				loadComponent: () => import('./pages/admin-usuarios/admin-usuarios.component').then((m) => m.AdminUsuariosComponent),
				canActivate: [RoleGuard],
				data: { roles: [RolUsuario.ADMIN] },
			},
			// Refactored 'Facturacion' to represent 'Historial de Viajes' or Billing
			{
				path: 'viajes',
				loadComponent: () => import('./pages/viajes/viajes.component').then((m) => m.ViajesComponent),
				canActivate: [RoleGuard],
				data: { roles: [RolUsuario.ADMIN, RolUsuario.CLIENTE, RolUsuario.CONDUCTOR] },
			},
			// New Route
			{
				path: 'pedir-taxi',
				loadComponent: () => import('./pages/viajes/solicitar-viaje/solicitar-viaje.component'),
				data: { roles: [RolUsuario.CLIENTE, RolUsuario.ADMIN] },
			},
			{
				path: '',
				redirectTo: 'home',
				pathMatch: 'full',
			},
		],
	},
] as Routes;
