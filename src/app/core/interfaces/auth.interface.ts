// export interface LoginRequest {
// 	username: string;
// 	password: string;
// }

// export interface UserData {
// 	id: number;
// 	username: string;
// 	first_name: string;
// 	last_name: string;
// 	email: string;
// 	rol?: string;
// }

// export interface LoginResponse {
// 	message: string;
// 	user: UserData;
// }

// src/app/core/interfaces/auth.interface.ts

export interface LoginRequest {
	email: string;
	password: string;
}

export interface UserData {
	id: number;
	username: string;
	first_name?: string; // Optional legacy
	last_name?: string; // Optional legacy
	nombres?: string; // New field
	apellidos?: string; // New field
	email: string;
	rol?: string;
	esta_activo?: boolean; // New field
}

// ⬅️ ¡AÑADE ESTA INTERFAZ!
// Esta es la respuesta que nos da el endpoint /api/v1/token/
export interface TokenResponse {
	refresh: string;
	access: string;
	user_id?: string;
	email?: string;
	nombre?: string;
	rol?: string;
}

// (Puedes borrar 'export interface LoginResponse' si todavía existe aquí)
