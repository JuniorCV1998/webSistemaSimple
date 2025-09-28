import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'twoDigits',
  standalone: true
})
export class TwoDigitsPipe implements PipeTransform {

  transform(value: number | null | undefined): string {
    if (value == null || isNaN(value)) return '';
    return value.toString().padStart(2, '0');
  }
}
