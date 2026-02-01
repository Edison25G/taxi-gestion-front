import { RolUsuario } from './role.enum';

// Define la estructura de un objeto Usuario (del sistema)
export interface AdminUsuario {
	id?: number;
	username?: string; // Optional legacy
	email: string;
	first_name?: string; // Optional legacy
	last_name?: string; // Optional legacy
	nombres?: string; // New field
	apellidos?: string; // New field
	identificacion?: string; // New field
	telefono?: string; // New field
	direccion?: string; // New field
	password?: string; // Solo para crear
	rol: RolUsuario;
	is_active?: boolean; // Optional legacy
	esta_activo?: boolean; // New field
}
