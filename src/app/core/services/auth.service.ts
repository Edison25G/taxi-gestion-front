import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, throwError, map, catchError, tap, of, delay } from 'rxjs';
import { environment } from './../../environments/environment.development';
import { ErrorService } from '../../auth/core/services/error.service';
import { LoginRequest, UserData } from '../../core/interfaces/auth.interface';
import { UserRepository } from '../domain/repositories/user.repository';
import { RolUsuario } from '../models/role.enum';

@Injectable({
	providedIn: 'root',
})
export class AuthService implements UserRepository {
	public usuario = signal<UserData | null>(null);
	private http = inject(HttpClient);
	private errorService = inject(ErrorService);

	constructor() {
		const userJson = localStorage.getItem('user');
		if (userJson) {
			this.usuario.set(JSON.parse(userJson));
		}
	}

	// --- MÉTODOS DE ESTADO ---
	getCurrentUser(): UserData | null {
		return this.usuario();
	}

	isAuthenticated(): boolean {
		return !!localStorage.getItem('token');
	}

	getRole(): string | null {
		if (this.usuario() && this.usuario()?.rol) {
			return this.usuario()?.rol || null;
		}
		return null;
	}

	// ✅ VITAL: Este método une lo que el Backend nos envió
	// El MedidorService usa esto para filtrar la lista.
	getNombreCompleto(): string {
		const user = this.usuario();
		if (user) {
			const nombre = `${user.first_name} ${user.last_name}`;
			return nombre.trim();
		}
		return '';
	}

	logout(): void {
		this.usuario.set(null);
		localStorage.removeItem('user');
		localStorage.removeItem('token');
	}

	// --- DECODIFICACIÓN JWT ---
	private decodeToken(token: string): any {
		try {
			const base64Url = token.split('.')[1];
			const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
			const jsonPayload = decodeURIComponent(
				window
					.atob(base64)
					.split('')
					.map(function (c) {
						return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
					})
					.join(''),
			);
			return JSON.parse(jsonPayload);
		} catch (e) {
			console.error('Error decodificando token', e);
			return {};
		}
	}

	// --- LOGIN ---
	login(credentials: LoginRequest): Observable<UserData> {
		// --- MOCK LOGIN PARA DESARROLLO/DEFENSA ---
		console.warn('⚠️ USANDO MOCK LOGIN - NO CONECTADO AL BACKEND');

		const username = credentials.username.toLowerCase();
		let role = RolUsuario.CLIENTE;
		let nombre = 'Usuario Visitante';

		// 1. LÓGICA DE ROLES
		if (username.includes('admin')) {
			role = RolUsuario.ADMIN;
			nombre = 'Administrador Sistema';
		} else if (username.includes('conductor') || username.includes('chofer')) {
			role = RolUsuario.CONDUCTOR;
			nombre = 'Juan Pérez (Chofer)';
		} else {
			role = RolUsuario.CLIENTE;
			nombre = 'Maria López (Cliente)';
		}

		const mockUser: UserData = {
			id: 1,
			username: credentials.username,
			first_name: nombre, // Mantener para compatibilidad
			last_name: '',
			nombres: nombre,
			apellidos: '',
			email: `${username}@taxi.com`,
			rol: role,
			esta_activo: true,
		};

		return of(mockUser).pipe(
			delay(800), // Simular delay de red
			map((user) => {
				// Guardamos token ficticio y usuario
				localStorage.setItem('token', 'mock-jwt-token-defense-mode');
				localStorage.setItem('user', JSON.stringify(user));
				this.usuario.set(user);
				return user;
			}),
			tap(() => this.errorService.loginSuccess()),
		);
	}
}
