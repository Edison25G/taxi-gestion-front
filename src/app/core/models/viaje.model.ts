export interface Viaje {
	id: number | string;
	origen: string;
	destino: string;
	tarifa: number;
	estado: 'PENDIENTE' | 'ASIGNADO' | 'EN_CURSO' | 'FINALIZADO' | 'CANCELADO';
	clienteId?: number; // Optional mainly for mock compatibility
	conductorId?: number;
	conductor?: string; // Nombre del conductor para la tabla
}
