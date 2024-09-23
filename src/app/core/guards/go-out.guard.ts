import { CanDeactivateFn } from '@angular/router';

export const goOutGuard: CanDeactivateFn<unknown> = (component, currentRoute, currentState, nextState) => {
  return true;
};
