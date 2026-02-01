import { RolUsuario } from './role.enum';

export interface Usuario {
	id: number;
	tipo_identificacion: 'C' | 'R' | 'P'; // C: Cédula, R: RUC, P: Pasaporte
	identificacion: string;
	nombres: string;
	apellidos: string;
	email: string | null;
	telefono?: string;
	direccion: string;
	rol: RolUsuario | string; // Puede venir como Enum o como texto del backend
	esta_activo: boolean;
	usuario_id?: number; // ID del usuario asociado (opcional)
}
