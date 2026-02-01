import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Usuario } from '../models/usuario.interface';

import { environment } from '../../environments/environment.development';

@Injectable({
	providedIn: 'root',
})
export class UsuarioService {
	private http = inject(HttpClient);

	private baseUrl = environment.apiUrl + '/socios/';

	getUsuarios(): Observable<Usuario[]> {
		return this.http.get<any>(this.baseUrl).pipe(
			map((response) => {
				// Si viene paginado (Django REST Framework por defecto devuelve { count, next, previous, results: [] })
				if (response.results) {
					return response.results;
				}
				// Si es un array directo
				return Array.isArray(response) ? response : [response];
			}),
			catchError(this.handleError),
		);
	}
	getUsuario(id: number): Observable<Usuario> {
		return this.http.get<Usuario>(`${this.baseUrl}${id}/`).pipe(catchError(this.handleError));
	}
	crearUsuario(usuario: Usuario): Observable<Usuario> {
		return this.http.post<Usuario>(this.baseUrl, usuario).pipe(catchError(this.handleError));
	}

	actualizarUsuario(id: number, usuario: Partial<Usuario>): Observable<Usuario> {
		return this.http.put<Usuario>(`${this.baseUrl}${id}/`, usuario).pipe(catchError(this.handleError));
	}

	deleteUsuario(id: number): Observable<void> {
		return this.http.delete<void>(`${this.baseUrl}${id}/`).pipe(catchError(this.handleError));
	}

	private handleError(error: HttpErrorResponse) {
		// Si es error de validación (400), lo devolvemos tal cual para que el componente lo maneje
		if (error.status === 400) {
			return throwError(() => error);
		}

		let errorMessage = 'Ocurrió un error desconocido.';
		if (error.status === 0) {
			errorMessage = 'Error de Conexión. Verifique su conexión a internet o el servidor.';
		} else if (error.status === 404) {
			errorMessage = 'Recurso no encontrado (404).';
		} else if (error.status === 403) {
			errorMessage = 'No tiene permisos para realizar esta acción.';
		} else {
			errorMessage = `Error ${error.status}: ${error.message}`;
		}

		console.error(error);
		return throwError(() => new Error(errorMessage));
	}
}
