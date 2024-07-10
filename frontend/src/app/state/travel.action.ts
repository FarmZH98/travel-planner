import { createAction, props } from '@ngrx/store';
import { Travel } from '../model';


export const loadTravels = createAction(
  '[Travel] Load Travels',
  props<{ travels: Travel[] }>()
);

export const addTravel = createAction(
  '[Travel] Add Travel',
  props<{ travel: Travel }>()
);

export const updateTravel = createAction(
  '[Travel] Update Travel',
  props<{ travel: Travel }>()
);

export const deleteTravel = createAction(
  '[Travel] Delete Travel',
  props<{ id: string }>()
);
