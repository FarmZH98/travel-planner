import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TravelStateModel } from './travel.reducer';

export const selectTravelState = createFeatureSelector<TravelStateModel>('travels');

export const selectAllTravels = createSelector(
  selectTravelState,
  (state: TravelStateModel) => state.travels
);

export const selectTravelById = (id: string) => createSelector(
  selectTravelState,
  (state: TravelStateModel) => state.travels.find(travel => travel.id === id)
);


