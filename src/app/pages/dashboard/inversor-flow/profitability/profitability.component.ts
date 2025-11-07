import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TabMenuModule } from 'primeng/tabmenu';

@Component({
  selector: 'app-profitability',
  standalone: true,
  imports: [TabMenuModule,RouterLink, ButtonModule],
  templateUrl: './profitability.component.html',
  styleUrl: './profitability.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export default class ProfitabilityComponent {

}
