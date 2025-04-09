import { Component } from '@angular/core';
import { LoginComponent } from './login/login.component';
import { RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LoginComponent,RouterOutlet], // Removed RouterOutlet
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'adminpage';
}
