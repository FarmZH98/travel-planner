import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HomeComponent } from './components/home.component';
import { RouterModule, Routes } from '@angular/router';
import { LoginService } from './services/login.service';
import { FormRepository } from './repo/form.repository';
import { SignUpComponent } from './components/sign-up.component';
import { NewEntryComponent } from './components/new-entry.component';

//Material imports
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';

import { GoogleMapsModule } from '@angular/google-maps';
import { TravelService } from './services/travel.service';

const appRoutes: Routes = [
  {path: '', component: LoginComponent},
  {path: 'home', component: HomeComponent},
  {path: 'signup', component: SignUpComponent},
  {path: 'new', component: NewEntryComponent},
  { path: '**', redirectTo: '/',  pathMatch:"full" }
]

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    SignUpComponent,
    NewEntryComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatToolbarModule,
    MatDividerModule,
    MatFormFieldModule,
    MatRadioModule,
    MatInputModule,
    MatListModule,
    MatIconModule,
    MatCheckboxModule,
    MatButtonModule,
    GoogleMapsModule,
    RouterModule.forRoot(appRoutes, { useHash: true })
  ],
  providers: [
    TravelService, LoginService, FormRepository, provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
