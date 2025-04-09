import { Database, ref, onValue, push, remove, set } from '@angular/fire/database';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-dashboard-admin',
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class DashboardAdminComponent implements OnInit, OnDestroy {
  constructor(private db: Database, private http: HttpClient, private router: Router,private cdr: ChangeDetectorRef) {}

  currentTab: string = 'drivers';
  url: string = 'https://pfaautowaidbackend.onrender.com/api/users'; // Corrected base API URL

  firebaseDrivers: {
    [key: string]: { username?: string; email?: string; vehicle?: string; latitude?: number; longitude?: number; phone?: number; role?: string }
  } = {};
  firebaseUsers: {
    [key: string]: { data: { username?: string; email?: string; latitude?: number; longitude?: number; phone?: number; role?: string; fcmToken?: string } }
  } = {};
  requests: { [key: string]: { userId: string; driverId: string; status: string } } = {};
  // Updated MySQL types to match the screenshot
  mysqlDrivers: { id: number; username?: string; email?: string; password?: string; role?: string; cin?: string; phone?: number; latitude?: number; longitude?: number }[] = [];
  mysqlUsers: { id: number; username?: string; email?: string; password?: string; role?: string; cin?: string; phone?: number; latitude?: number; longitude?: number }[] = [];
  profits: { [key: string]: { amount: number; date?: string } } = {};

  // Updated newDriver and newUser to include MySQL fields
  newDriver = { username: '', email: '', password: '', role: 'Driver', cin: '', phone: 0, latitude: 0, longitude: 0 };
  newUser = { username: '', email: '', password: '', role: 'Client', cin: '', phone: 0, latitude: 0, longitude: 0 };
  totalProfit: number = 0;

  editingFirebaseDriverId: string | null = null;
  editingFirebaseUserId: string | null = null;
  editingMysqlDriverId: number | null = null;
  editingMysqlUserId: number | null = null;
  editingFirebaseDriver: any = null;
  editingFirebaseUser: any = null;
  editingMysqlDriver: any = null;
  editingMysqlUser: any = null;

  private subscriptions: Subscription[] = [];
  ngOnInit(): void {
    console.log('[ngOnInit] Component initialized');
    this.fetchFirebaseData('drivers', (data) => (this.firebaseDrivers = data || {}));
    this.fetchFirebaseData('users', (data) => (this.firebaseUsers = data || {}));
    this.fetchFirebaseData('requests', (data) => (this.requests = data || {}));
    this.fetchFirebaseData('profits', (data) => {
      this.profits = data || {};
      this.calculateTotalProfit();
    });

    this.fetchMysqlUsers();
    this.fetchMysqlDrivers();
  }

  ngOnDestroy(): void {
    console.log('[ngOnDestroy] Component destroyed, unsubscribing...');
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  fetchFirebaseData(path: string, callback: (data: any) => void) {
    console.log(`[fetchFirebaseData] Fetching Firebase data at path: ${path}`);
    const dataRef = ref(this.db, path);
    const subscription = onValue(dataRef, (snapshot) => {
      const data = snapshot.val() || {};
      console.log(`[fetchFirebaseData] Data received for ${path}:`, data);
      callback(data);
    });
    this.subscriptions.push({ unsubscribe: () => subscription() } as Subscription);
  }

  fetchMysqlUsers() {
    console.log('[fetchMysqlUsers] Fetching MySQL users...', this.url);
    this.http.get<any[]>(`${this.url}/fetchUsers`).subscribe(
      (data) => {
        console.log('[fetchMysqlUsers] Users fetched:', data);
        this.mysqlUsers = data;
      },
      (error) => console.error('[fetchMysqlUsers] Error:', error)
    );
  }

  fetchMysqlDrivers() {
    console.log('*******************************************************************[fetchMysqlDrivers] Fetching MySQL drivers...');
    this.http.get<any[]>(`${this.url}/fetchDrivers`).subscribe(
      (data) => {
        console.log('[fetchMysqlDrivers] Drivers fetched:', data);
        this.mysqlDrivers = data;
      },
      (error) => console.error('[fetchMysqlDrivers] Error:', error)
    );
  }

  addMysqlDriver() {
    console.log('[addMysqlDriver] Adding new driver:', this.newDriver);
    if (this.newDriver.username && this.newDriver.email && this.newDriver.password) {
      const driver = {
        ...this.newDriver,
        role: 'Driver',
        latitude: this.newDriver.latitude || 0,
        longitude: this.newDriver.longitude || 0,
        phone: this.newDriver.phone || 0,
        cin: this.newDriver.cin || '',
      };
      this.http.post(`${this.url}/register`, driver).subscribe(
        () => {
          console.log('[addMysqlDriver] Driver added successfully');
          this.fetchMysqlDrivers();
          this.newDriver = { username: '', email: '', password: '', role: 'Driver', cin: '', phone: 0, latitude: 0, longitude: 0 };
        },
        (error) => console.error('[addMysqlDriver] Error:', error)
      );
    }
  }

  editMysqlDriver(driver: any) {
    console.log('[editMysqlDriver] Editing driver:', driver);
    this.editingMysqlDriverId = driver.id;
    this.editingMysqlDriver = { ...driver };
  }

  saveMysqlDriver(id: number) {
    console.log('[saveMysqlDriver] Saving driver with ID:', id);
    if (this.editingMysqlDriver?.username && this.editingMysqlDriver?.email) {
      this.http.put(`${this.url}/update/${id}`, this.editingMysqlDriver).subscribe(
        () => {
          console.log('[saveMysqlDriver] Driver updated');
          this.fetchMysqlDrivers();
          this.editingMysqlDriverId = null;
          this.editingMysqlDriver = null;
                    this.cdr.detectChanges(); // Force change detection after exiting edit mode

        },
        (error) => console.error('[saveMysqlDriver] Error:', error)
      );
    }
  }

  deleteMysqlDriver(id: number) {
    console.log('[deleteMysqlDriver] Deleting driver with ID:', id);
    this.http.delete(`${this.url}/delete/${id}`).subscribe(
      () => {
        console.log('[deleteMysqlDriver] Driver deleted');
        this.fetchMysqlDrivers();
      },
      (error) => console.error('[deleteMysqlDriver] Error:', error)
    );
  }

  cancelEditMysqlDriver() {
    console.log('[cancelEditMysqlDriver] Cancel editing MySQL driver');
    this.editingMysqlDriverId = null;
    this.editingMysqlDriver = null;
  }

  editFirebaseDriver(id: string, driver: any) {
    console.log('[editFirebaseDriver] Editing Firebase driver:', id, driver);
    this.editingFirebaseDriverId = id;
    this.editingFirebaseDriver = { ...driver };
  }

  saveFirebaseDriver(id: string) {
    console.log('[saveFirebaseDriver] Saving Firebase driver with ID:', id);
    if (this.editingFirebaseDriver?.username && this.editingFirebaseDriver?.email) {
      const driverRef = ref(this.db, `drivers/${id}`);
      set(driverRef, this.editingFirebaseDriver);
      this.editingFirebaseDriverId = null;
      this.editingFirebaseDriver = null;
    }
  }

  deleteFirebaseDriver(id: string) {
    console.log('[deleteFirebaseDriver] Deleting Firebase driver with ID:', id);
    const driverRef = ref(this.db, `drivers/${id}`);
    remove(driverRef);
  }

  cancelEditFirebaseDriver() {
    console.log('[cancelEditFirebaseDriver] Cancel editing Firebase driver');
    this.editingFirebaseDriverId = null;
    this.editingFirebaseDriver = null;
  }

  addMysqlUser() {
    console.log('[addMysqlUser] Adding new user:', this.newUser);
    if (this.newUser.username && this.newUser.email && this.newUser.password) {
      const user = {
        ...this.newUser,
        role: 'Client',
        latitude: this.newUser.latitude || 0,
        longitude: this.newUser.longitude || 0,
        phone: this.newUser.phone || 0,
        cin: this.newUser.cin || '',
      };
      this.http.post(`${this.url}/register`, user).subscribe(
        () => {
          console.log('[addMysqlUser] User added');
          this.fetchMysqlUsers();
          this.newUser = { username: '', email: '', password: '', role: 'Client', cin: '', phone: 0, latitude: 0, longitude: 0 };
        },
        (error) => console.error('[addMysqlUser] Error:', error)
      );
    }
  }

  editMysqlUser(user: any) {
    console.log('[editMysqlUser] Editing user:', user);
    this.editingMysqlUserId = user.id;
    this.editingMysqlUser = { ...user };
  }

  saveMysqlUser(id: number) {
    console.log('[saveMysqlUser] Saving user with ID:', id);
    if (this.editingMysqlUser?.username && this.editingMysqlUser?.email) {
      this.http.put(`${this.url}/update/${id}`, this.editingMysqlUser).subscribe(
        () => {
          console.log('[saveMysqlUser] User updated');
          this.fetchMysqlUsers();
          this.editingMysqlUserId = null;
          this.editingMysqlUser = null;
        },
        (error) => console.error('[saveMysqlUser] Error:', error)
      );
    }
  }

  deleteMysqlUser(id: number) {
    console.log('[deleteMysqlUser] Deleting MySQL user with ID:', id);
    this.http.delete(`${this.url}/delete/${id}`).subscribe(
      () => {
        console.log('[deleteMysqlUser] User deleted');
        this.fetchMysqlUsers();
      },
      (error) => console.error('[deleteMysqlUser] Error:', error)
    );
  }

  cancelEditMysqlUser() {
    console.log('[cancelEditMysqlUser] Cancel editing MySQL user');
    this.editingMysqlUserId = null;
    this.editingMysqlUser = null;
  }

  editFirebaseUser(id: string, user: any) {
    console.log('[editFirebaseUser] Editing Firebase user:', id, user);
    this.editingFirebaseUserId = id;
    this.editingFirebaseUser = { ...user };
  }

  saveFirebaseUser(id: string) {
    console.log('[saveFirebaseUser] Saving Firebase user with ID:', id);
    if (this.editingFirebaseUser?.username && this.editingFirebaseUser?.email) {
      const userRef = ref(this.db, `users/${id}`);
      set(userRef, { data: this.editingFirebaseUser });
      this.editingFirebaseUserId = null;
      this.editingFirebaseUser = null;
    }
  }

  deleteFirebaseUser(id: string) {
    console.log('[deleteFirebaseUser] Deleting Firebase user with ID:', id);
    const userRef = ref(this.db, `users/${id}`);
    remove(userRef);
  }

  cancelEditFirebaseUser() {
    console.log('[cancelEditFirebaseUser] Cancel editing Firebase user');
    this.editingFirebaseUserId = null;
    this.editingFirebaseUser = null;
  }

  deleteRequest(id: string) {
    console.log('[deleteRequest] Deleting request with ID:', id);
    const requestRef = ref(this.db, `requests/${id}`);
    remove(requestRef);
  }

  calculateTotalProfit() {
    console.log('[calculateTotalProfit] Calculating total profit...');
    this.totalProfit = Object.values(this.profits || {}).reduce(
      (sum, profit) => sum + (profit.amount || 0),
      0
    );
    console.log('[calculateTotalProfit] Total profit:', this.totalProfit);
  }

  logout() {
    console.log('[logout] Logging out admin');
    localStorage.removeItem('isAdminLoggedIn');
    this.router.navigate(['/login']);
  }
}