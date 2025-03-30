import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { FooterModule } from './components/footer.module';
import { HeaderModule } from './components/header.module';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FooterModule, HeaderModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend';
}
