import { createReducer, on } from '@ngrx/store';
import * as TravelActions from './travel.action';
import { Travel } from '../model';

export interface TravelStateModel {
  travels: Travel[];
}

export const initialState: TravelStateModel = {
  travels: [],
};

export const travelReducer = createReducer(
  initialState,
  on(TravelActions.loadTravels, (state, { travels }) => ({
    ...state,
    travels: [...travels],
  })),
  on(TravelActions.addTravel, (state, { travel }) => ({
    ...state,
    travels: [...state.travels, travel],
  })),
  on(TravelActions.updateTravel, (state, { travel }) => ({
    ...state,
    travels: state.travels.map(t => t.id === travel.id ? travel : t),
  })),
  on(TravelActions.deleteTravel, (state, { id }) => ({
    ...state,
    travels: state.travels.filter(t => t.id !== id),
  }))
);

