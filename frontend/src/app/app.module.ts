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
import {MatCardModule} from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { GoogleMapsModule } from '@angular/google-maps';
import { TravelService } from './services/travel.service';
import { MatNativeDateModule } from '@angular/material/core';
import { EditComponent } from './components/edit.component';
import { ViewComponent } from './components/view.component';
import { leaveEditPage, leaveNewPage } from './guard';
import { WeatherService } from './services/weather.service';
import { OllamaService } from './services/ollama.service';

const appRoutes: Routes = [
  {path: '', component: LoginComponent},
  {path: 'home', component: HomeComponent},
  {path: 'signup', component: SignUpComponent},
  {path: 'new', component: NewEntryComponent, canDeactivate: [ leaveNewPage ]},
  {path: 'edit', component: EditComponent, canDeactivate: [ leaveEditPage ]},
  {path: 'view', component: ViewComponent},
  { path: '**', redirectTo: '/',  pathMatch:"full" }
]

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    SignUpComponent,
    NewEntryComponent,
    EditComponent,
    ViewComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatToolbarModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    GoogleMapsModule,
    RouterModule.forRoot(appRoutes, { useHash: true })
  ],
  providers: [
    TravelService, LoginService, WeatherService, OllamaService, FormRepository, provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
