import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(HttpClientModule) // Add HttpClientModule here
  ]
})
.catch(err => console.error(err));
