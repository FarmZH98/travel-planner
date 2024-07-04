import { Injectable } from "@angular/core";
import { ComponentStore } from "@ngrx/component-store";
import { Travel, TravelsSlice } from "./model";

const INIT_VALUE: TravelsSlice = {
    trips: []
}

//use 
// firstValueFrom(
//     this.weatherSvc.onWeather.asObservable().pipe(skip(1))
// ).then(result => {
//     console.info('>>>> PROMISE ', result)
//   })

@Injectable()
export class TravelStore extends ComponentStore<TravelsSlice> {

  constructor() { super(INIT_VALUE) }

  // updater / reducer
  readonly saveResult = this.updater<Travel>(
    (currStore: TravelsSlice, result: Travel) => {
      const newStore: TravelsSlice = { ...currStore }
      newStore.trips.push(result)
      return newStore
    }
  )

  readonly clearStore = this.updater((currStore: TravelsSlice) => ({
    ...currStore,
    trips: []
  }));

  // query / selector
  // can be used to get all ids
  readonly getSavedSearches = this.select<string[]>(
    (currStore: TravelsSlice) => {
      return currStore.trips.map(trip => trip.id)
    }
  )

  readonly getSavedSearchesById = (id: string) =>
    this.select<Travel | undefined>(
      (currStore: TravelsSlice) =>
        currStore.trips.find(trip => trip.id == id)
    )

  readonly f = (x: number) =>
    (n: number) => {
      console.info(`n: ${n}, x: ${x}`)
    }

  readonly getFullSavedSearches = this.select<Travel[]>(
    (currStore: TravelsSlice) => currStore.trips
  )

  //can put into home page
  readonly getCachedResultCount = this.select<number>(
    // SQL
    (currStore: TravelsSlice) => currStore.trips.length
  )

}