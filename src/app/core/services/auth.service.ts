import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, throwError, map, catchError, tap, of, delay } from 'rxjs';
import { environment } from './../../environments/environment';
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
		return this.http.post<any>(`${environment.apiUrl}/auth/login/`, credentials).pipe(
			map((response) => {
				// El backend devuelve: { refresh, access, user_id, email, nombre, rol }
				const user: UserData = {
					id: response.user_id || 0, // El backend podría mandar UUID, ajustamos si es necesario
					email: response.email,
					nombres: response.nombre,
					rol: response.rol,
					esta_activo: true, // Asumimos true al loguear
				} as UserData;

				// Guardamos en localStorage
				localStorage.setItem('token', response.access);
				localStorage.setItem('refresh_token', response.refresh);
				localStorage.setItem('user', JSON.stringify(user));

				// Actualizamos señal
				this.usuario.set(user);

				return user;
			}),
			tap(() => this.errorService.loginSuccess()),
			catchError((error) => {
				console.error('Login error', error);
				// Dejamos que el componente maneje el error o lanzamos uno genérico
				return throwError(() => new Error('Credenciales inválidas o error de servidor'));
			}),
		);
	}

	// --- REGISTRO ---
	registro(datos: { nombre: string; email: string; password: string }) {
		// Agregamos el rol automáticamente para que siempre sea CLIENTE
		const payload = { ...datos, rol: 'CLIENTE' };

		return this.http.post(`${environment.apiUrl}/auth/registro/`, payload);
	}

	// --- REGISTRO CONDUCTOR ---
	registroConductor(datos: { nombre: string; email: string; password: string }) {
		const payload = { ...datos, rol: 'CONDUCTOR' };
		return this.http.post(`${environment.apiUrl}/auth/registro/`, payload);
	}
}
