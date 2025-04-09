import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardAdminComponent } from './dashboard-admin/dashboard-admin.component';
import { AuthGuard } from './auth-guard.service';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardAdminComponent }
];