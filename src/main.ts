import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { AngularFireModule } from '@angular/fire/compat';
import { provideHttpClient } from '@angular/common/http';

const firebaseConfig = {
    apiKey: "AIzaSyA_msqy4A6V7yowc-_A5LU8xsugI6LZfZY",
    authDomain: "userlocationapp-6a902.firebaseapp.com",
    databaseURL:
    "https://userlocationapp-6a902-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "userlocationapp-6a902",
    storageBucket: "userlocationapp-6a902.firebasestorage.app",
    messagingSenderId: "825587724391",
    appId: "1:825587724391:web:9b2cc0bbaf13e1c847e4c2",
  };

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    // New Firebase initialization
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideDatabase(() => getDatabase()),
    provideHttpClient(), // Add this line to provide HttpClient
    // Compatibility mode initialization removed as it's not compatible with bootstrapApplication
  ]
});