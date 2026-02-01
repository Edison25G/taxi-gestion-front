import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
	selector: 'amc-footer',
	standalone: true,
	imports: [RouterModule],
	templateUrl: './footer.component.html',
	styleUrls: [],
})
export class FooterComponent {
	abrirWhatsApp(): void {
		const numero = '593985557248';
		const mensaje = encodeURIComponent('........');
		const url = `https://wa.me/${numero}?text=${mensaje}`;
		window.open(url, '_blank');
	}
}
