
export const MEAL_PERIODS: string[] = [
  "Breakfast", 
  "Lunch", 
  "Dinner",
];

export enum serviceCategory {
  DINE_IN     = 'DineIn',
  TAKE_AWAY   = 'TakeAway'
}

export enum serviceStatus {
  DONE          = 'Done',
  WAITING       = 'Waiting',
  PREPARING     = 'Preparing',
  IN_PROGRESS   = 'InProgress',
}

export enum messageType {
  VERIFIED     = 'verified_employee',
  SELECTED     = 'selected_meal_service'
}
