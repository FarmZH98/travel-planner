import { Component, inject, OnInit, } from '@angular/core';
import { Router } from '@angular/router';
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

    const token: string = localStorage.getItem('token')
    if(localStorage.getItem('token') == null) {
      this.router.navigate(['/'])
    } 

    //get user details to display welcome
    this.travelService.getTripsSummary(token)
    .then(
      (response: any) => {
        for(var i=0; i<response.travels.length; ++i) {
          var trip = JSON.parse(response.travels[i])
          console.log(trip)
          trip.startDate = trip.startDate.replace(' 00:00:00 GMT+08:00', '');
          trip.startDate = trip.startDate.replace(' 16:00:00 UTC', '');
          trip.endDate = trip.endDate.replace(' 00:00:00 GMT+08:00', '');
          trip.endDate = trip.endDate.replace(' 16:00:00 UTC', '');
          this.plans.push(trip)
        }
        console.log(this.plans)
      }
    ).catch(error => {
      //alert(error.message)
      console.log(error)
    });
  }

  edit(plan: any) {
    const queryParams = { id: plan.id }
    this.router.navigate(['/edit'] , { queryParams })
  }

  view(plan: any) {
    const queryParams = { id: plan.id }
    this.router.navigate(['/view'] , { queryParams })
  }

  logout() {
    localStorage.removeItem('token')
    this.router.navigate(['/'])
  }
}
