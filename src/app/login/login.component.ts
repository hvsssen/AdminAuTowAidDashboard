import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private router: Router,private authService: AuthService) {} ;  

  login() {
    this.authService.login(this.email, this.password).subscribe(
      (response: any) => {
        console.log("User Info:", response); // Afficher les infos reçues
        alert(JSON.stringify(response, null, 2)); // Le second paramètre améliore la lisibilité
  
        if (response) {
          localStorage.setItem('user', JSON.stringify(response));
          localStorage.setItem('isAdminLoggedIn', 'true');
          this.router.navigate(['/dashboard']); // Stocke l'objet User
        }
      },
      (error: any) => {
        console.log("Login Error:", error);
        alert(error.error.message || 'Invalid email or password');
      }
    );
  }
  
}
// Removed the unused JsonStringfy function

