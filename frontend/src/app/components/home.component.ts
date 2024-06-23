import { AfterViewInit, Component, Inject, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom, Subject, Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormRepository } from '../repo/form.repository';
import { TravelService } from '../services/travel.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})

export class HomeComponent implements OnInit {

  plans: any = [];
  private readonly router = inject(Router)
  private readonly travelService = inject(TravelService)

  ngOnInit(): void {
    //check for token

    const token: string = localStorage.getItem('token') ?? '';

    if(localStorage.getItem('token') == '') {
      this.router.navigate(['/'])
    } 

    //get user details to display welcome
    this.travelService.getTravelDetails(token)
    .then(
      (response) : any => 
        console.log(response)
    ).catch(error => 
      console.log(error)
    );
  }

  edit(plan: any) {
    throw new Error('Method not implemented.');
  }

  view(plan: any) {
    throw new Error('Method not implemented.');
  }

  logout() {
    localStorage.removeItem('token')
  }
}
