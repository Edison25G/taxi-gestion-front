import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class ConductorService {
	private http = inject(HttpClient);
	private apiUrl = `${environment.apiUrl}/conductor/estado/`; // Endpoint para cambiar estado

	cambiarEstado(
		nuevoEstado: 'DISPONIBLE' | 'FUERA_DE_SERVICIO',
		ubicacion?: { latitud: number; longitud: number },
	): Observable<any> {
		return this.http.put(this.apiUrl, { estado: nuevoEstado, ...ubicacion });
	}

	obtenerEstado(): Observable<{ estado: 'DISPONIBLE' | 'FUERA_DE_SERVICIO' }> {
		return this.http.get<{ estado: 'DISPONIBLE' | 'FUERA_DE_SERVICIO' }>(this.apiUrl);
	}
}
