import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatNumber',
  standalone: true
})
export class FormatNumberPipe implements PipeTransform {

  transform(
    value: number | null | undefined,
    locale: string = 'en-US',
    minFractionDigits: number = 2,
    maxFractionDigits: number = 2,
    hideDecimalsForThousands: boolean = false
  ): string {
    if (value == null || Number.isNaN(value)) return '';
    const abs = Math.abs(value);
    if (hideDecimalsForThousands && abs >= 1000 && Number.isInteger(value)) {
      return value.toLocaleString(locale);
    }
    return value.toLocaleString(locale, {
      minimumFractionDigits: minFractionDigits,
      maximumFractionDigits: maxFractionDigits
    });
  }

  /* 
  <p>Por defecto: {{ 5000 | formatNumber }}</p>
    <p>Sin decimales para miles: {{ 5000 | formatNumber:'en-US':2:2:true }}</p>
    <p>1 → {{ 1 | formatNumber:'en-US':2:2:true }}</p>
    <p>1234.5 → {{ 1234.5 | formatNumber }}</p> 
  */

}
