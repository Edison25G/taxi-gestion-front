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
	selector: 'app-register-client',
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
	templateUrl: './register-client.component.html',
})
export default class RegisterClientComponent {
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
				identificacion: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]], // Cédula 10 dígitos
				email: ['', [Validators.required, Validators.email]],
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
		const { nombres, apellidos, email, password } = this.registerForm.value;
		const nombreCompleto = `${nombres} ${apellidos}`;

		this.authService
			.registro({
				nombre: nombreCompleto,
				email,
				password,
			})
			.subscribe({
				next: () => {
					this.isLoading = false;
					this.messageService.add({
						severity: 'success',
						summary: 'Cuenta Creada',
						detail: 'Registro exitoso. Por favor inicia sesión.',
						life: 3000,
					});
					setTimeout(() => this.router.navigate(['/auth/login']), 2000);
				},
				error: (err) => {
					this.isLoading = false;
					console.error('Error registro:', err);

					let errorMsg = 'No se pudo crear la cuenta.';
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
