import { formatDate } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatDate',
  standalone: true
})
export class FormatDatePipe implements PipeTransform {

  transform(
    value: Date | string | number | null | undefined,
    format: string = 'dd MMM yyyy',
    locale: string = 'en-US'
  ): string {
    if (!value) return '';
    return formatDate(value, format, locale);
  }

}
