import { Component, OnInit, HostListener, inject } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

// PrimeNG
import { PopoverModule } from 'primeng/popover';
import { AvatarModule } from 'primeng/avatar';

// Componentes y Servicios
import { FooterComponent } from '../../common/components/footer/footer.component';
import { AuthService } from '../../core/services/auth.service';
import { RolUsuario } from '../../core/models/role.enum';

interface SideNavItem {
	label: string;
	icon: string;
	link: string;
	roles: RolUsuario[];
	header?: string; // ✅ NUEVO: Para poner títulos separadores visuales
}

@Component({
	selector: 'ca-dashboard-layout',
	standalone: true,
	imports: [RouterOutlet, CommonModule, RouterModule, PopoverModule, FooterComponent, AvatarModule],
	templateUrl: './dashboard-layout.component.html',
	styleUrls: ['./dashboard-layout.component.css'],
})
export class DashboardLayoutComponent implements OnInit {
	private router = inject(Router);
	private authService = inject(AuthService);

	menuOpen = false;
	isMobile = false;

	currentUser!: string;
	currentRole: RolUsuario | null = null;

	public roleEnum = RolUsuario;

	// ✅ MENÚ TAXI (Limpieza estricta)
	menuItems: SideNavItem[] = [
		{
			label: 'Inicio',
			icon: 'pi pi-home',
			link: '/dashboard/home',
			roles: [RolUsuario.ADMIN, RolUsuario.CLIENTE, RolUsuario.CONDUCTOR],
		},
		{
			label: 'Pedir Taxi',
			icon: 'pi pi-car',
			link: '/dashboard/pedir-taxi',
			roles: [RolUsuario.CLIENTE, RolUsuario.ADMIN],
		},
		{
			label: 'Historial de Viajes',
			icon: 'pi pi-map-marker',
			link: '/dashboard/viajes',
			roles: [RolUsuario.ADMIN, RolUsuario.CLIENTE, RolUsuario.CONDUCTOR],
		},
		{
			label: 'Usuarios (Admin)',
			icon: 'pi pi-users',
			link: '/dashboard/usuarios',
			roles: [RolUsuario.ADMIN],
		},
	];

	ngOnInit(): void {
		this.checkScreen();
		const roleString = this.authService.getRole();

		// Normalizar el rol a mayúsculas para comparación consistente
		if (roleString) {
			const roleUpper = roleString.toUpperCase();
			// Mapear el rol del backend al enum
			if (roleUpper === 'ADMINISTRADOR' || roleUpper === 'ADMIN') {
				this.currentRole = RolUsuario.ADMIN;
			} else if (roleUpper === 'CLIENTE') {
				this.currentRole = RolUsuario.CLIENTE;
			} else if (roleUpper === 'CONDUCTOR') {
				this.currentRole = RolUsuario.CONDUCTOR;
			} else {
				this.currentRole = null;
			}
		} else {
			this.currentRole = null;
		}

		const nombreReal = this.authService.getNombreCompleto();

		// Si nombreReal no está vacío (""), lo usamos. Si está vacío, usamos el Rol como respaldo.
		this.currentUser = nombreReal ? nombreReal : roleString || 'Usuario';
	}

	onMenuClick(): void {
		if (this.isMobile) {
			this.menuOpen = false;
		}
	}

	logout(): void {
		this.authService.logout();
		this.router.navigate(['/auth/login']);
	}

	hasAccess(itemRoles: RolUsuario[]): boolean {
		if (!this.currentRole) {
			return false;
		}
		return itemRoles.includes(this.currentRole);
	}

	@HostListener('window:resize', [])
	checkScreen(): void {
		this.isMobile = window.innerWidth < 1024;
		if (!this.isMobile) {
			this.menuOpen = false;
		}
	}
}
