import { trigger, transition, style, animate, group, query } from '@angular/animations';

export const slideInAnimation =
  trigger('routeAnimations', [
        // Slide Up
        transition('slideUp <=> *', [
          style({ position: 'relative' }),
          query(':enter, :leave', [
            style({ position: 'absolute', width: '100%', top: 0, left: 0 })
          ], { optional: true }),
          group([
            query(':leave', [
              animate('300ms ease', style({ top: '-100%', opacity: 0 }))
            ], { optional: true }),
            query(':enter', [
              style({ top: '100%', opacity: 0 }),
              animate('300ms ease', style({ top: '0%', opacity: 1 }))
            ], { optional: true })
          ])
        ]),
      
        // Fade
        transition('fade <=> *', [
          query(':enter, :leave', [
            style({ position: 'absolute', width: '100%' })
          ], { optional: true }),
          group([
            query(':leave', [
              animate('300ms ease-out', style({ opacity: 0 }))
            ], { optional: true }),
            query(':enter', [
              style({ opacity: 0 }),
              animate('300ms ease-out', style({ opacity: 1 }))
            ], { optional: true })
          ])
        ]),
      
        // Zoom
        transition('zoom <=> *', [
          style({ position: 'relative' }),
          query(':enter, :leave', [
            style({ position: 'absolute', width: '100%', top: 0, left: 0 })
          ], { optional: true }),
          group([
            query(':leave', [
              animate('300ms ease', style({ transform: 'scale(0.8)', opacity: 0 }))
            ], { optional: true }),
            query(':enter', [
              style({ transform: 'scale(1.2)', opacity: 0 }),
              animate('300ms ease', style({ transform: 'scale(1)', opacity: 1 }))
            ], { optional: true })
          ])
        ]),
  
        // Slide horizontal
        transition('slideRight <=> *', [
          style({ position: 'relative' }),
          query(':enter, :leave', [
            style({
              position: 'absolute',
              width: '100%',
              top: 0,
              left: 0
            })
          ], { optional: true }),
          group([
            query(':leave', [
              animate('300ms ease-out', style({ left: '-100%', opacity: 0 }))
            ], { optional: true }),
            query(':enter', [
              style({ left: '100%', opacity: 0 }),
              animate('300ms ease-out', style({ left: '0%', opacity: 1 }))
            ], { optional: true })
          ])
        ])
  
      ])
    
  ;
