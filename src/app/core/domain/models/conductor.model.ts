import { UserData } from '../../interfaces/auth.interface';

export interface Conductor extends UserData {
	licencia?: string;
	placa?: string;
	modeloAuto?: string;
	calificacion?: number;
	ubicacionActual?: { lat: number; lng: number };
}
