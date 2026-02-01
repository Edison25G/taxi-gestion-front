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

		// Simulación de registro
		setTimeout(() => {
			this.isLoading = false;
			this.messageService.add({
				severity: 'success',
				summary: 'Registro Exitoso',
				detail: 'Bienvenido a Taxi Gestión',
			});
			setTimeout(() => this.router.navigate(['/auth/login']), 1500);
		}, 1500);
	}
}
