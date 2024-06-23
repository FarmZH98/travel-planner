import { AfterViewInit, Component, Inject, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom, Subject, Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Upload } from '../model';
import { FormRepository } from '../repo/form.repository';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})

export class HomeComponent  {


}
