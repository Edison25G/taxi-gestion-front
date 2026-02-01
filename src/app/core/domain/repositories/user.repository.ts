import { Observable } from 'rxjs';
import { LoginRequest, UserData } from '../../interfaces/auth.interface';

// Patrón Repositorio: Define QUÉ se puede hacer, no CÓMO.
// Esto desacopla la lógica de negocio de la implementación específica (HTTP, Firebase, LocalStorage).
export abstract class UserRepository {
	abstract login(credentials: LoginRequest): Observable<UserData>;
	abstract logout(): void;
	abstract isAuthenticated(): boolean;
	abstract getCurrentUser(): UserData | null;
}
