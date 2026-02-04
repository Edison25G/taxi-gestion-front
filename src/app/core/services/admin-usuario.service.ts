import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from './../../environments/environment';

// ✅ IMPORTAMOS LA INTERFAZ Y EL ENUM
import { AdminUsuario } from '../models/admin-usuario.interface';

@Injectable({
	providedIn: 'root',
})
export class AdminUsuarioService {
	private http = inject(HttpClient);
	// Asegúrate de que este endpoint coincida con tu backend (ej. /usuarios/ o /users/)
	private apiUrl = `${environment.apiUrl}/usuarios/`;

	getAdminUsuarios(): Observable<AdminUsuario[]> {
		return this.http.get<AdminUsuario[]>(this.apiUrl);
	}

	create(usuario: AdminUsuario): Observable<AdminUsuario> {
		return this.http.post<AdminUsuario>(this.apiUrl, usuario);
	}

	update(id: number, usuario: Partial<AdminUsuario>): Observable<AdminUsuario> {
		return this.http.patch<AdminUsuario>(`${this.apiUrl}${id}/`, usuario);
	}

	delete(id: number): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}${id}/`);
	}
}
