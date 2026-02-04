import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { AuthService } from '../../../core/services/auth.service';

@Component({
	selector: 'app-register-driver',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		RouterModule,
		InputTextModule,
		PasswordModule,
		ButtonModule,
		DividerModule,
		ToastModule,
	],
	providers: [MessageService],
	templateUrl: './register-driver.component.html',
})
export default class RegisterDriverComponent {
	registerForm: FormGroup;
	isLoading = false;

	private fb = inject(FormBuilder);
	private router = inject(Router);
	private messageService = inject(MessageService);
	private authService = inject(AuthService);

	constructor() {
		this.registerForm = this.fb.group(
			{
				nombres: ['', Validators.required],
				apellidos: ['', Validators.required],
				identificacion: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
				email: ['', [Validators.required, Validators.email]],

				// Campos específicos de conductor
				licencia: ['', Validators.required],
				placa: ['', [Validators.required, Validators.minLength(6)]],
				modeloAuto: ['', Validators.required],

				password: ['', [Validators.required, Validators.minLength(6)]],
				confirmPassword: ['', Validators.required],
			},
			{ validators: this.passwordMatchValidator },
		);
	}

	passwordMatchValidator(g: FormGroup) {
		return g.get('password')?.value === g.get('confirmPassword')?.value ? null : { mismatch: true };
	}

	onSubmit() {
		if (this.registerForm.invalid) {
			this.registerForm.markAllAsTouched();
			return;
		}

		this.isLoading = true;

		// Extraemos los datos del formulario
		const { nombres, apellidos, email, password } = this.registerForm.value;
		// IMPORTANTE: Unimos nombres y apellidos porque el backend espera un solo campo "nombre"
		const nombreCompleto = `${nombres} ${apellidos}`;

		this.authService
			.registroConductor({
				nombre: nombreCompleto,
				email,
				password,
				// NOTA: Licencia, placa y modelo se podrían guardar en otro endpoint
				// o el backend podría actualizarse para recibirlos.
				// Por ahora registramos la cuenta base.
			})
			.subscribe({
				next: () => {
					this.isLoading = false;
					this.messageService.add({
						severity: 'success', // Cambiado a success
						summary: 'Cuenta Creada',
						detail: 'Conductor registrado correctamente. Por favor inicia sesión.',
						life: 3000,
					});
					setTimeout(() => this.router.navigate(['/auth/login']), 2000);
				},
				error: (err) => {
					this.isLoading = false;
					console.error('Error registro conductor:', err);

					let errorMsg = 'No se pudo registrar el conductor.';
					if (err.error && err.error.message) {
						errorMsg = err.error.message;
					} else if (err.status === 400) {
						errorMsg = 'Datos inválidos o el correo ya existe.';
					}

					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: errorMsg,
						life: 5000,
					});
				},
			});
	}
}
