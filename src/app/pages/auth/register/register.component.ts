import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { PasswordModule } from 'primeng/password';
import { CommonModule } from '@angular/common';
import { InputOtpModule } from 'primeng/inputotp';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ButtonModule,InputTextModule,CheckboxModule,PasswordModule,CommonModule,InputOtpModule,FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  isWriting: boolean = false;
  isWritingP: boolean = false;
  valueSS: string = '';
  valueShow: string = '_ _ _ _ _ _';

  onFocus(value:number) {
    if(value==1) this.isWriting = true;
    if(value==2) this.isWritingP = true;
  }

  onBlur(value: number) {
    if(value==1) this.isWriting = false;
    if(value==2) this.isWritingP = false;
  }

  onInputChange(){
    let n = this.valueSS.length;
    console.log("value: "+n);
    switch (n) {
      case 1:
        this.valueShow = this.valueSS + "_ _ _ _ _";
        break;
      case 2:
          this.valueShow = this.valueSS + "_ _ _ _";
          break;
      case 3:
          this.valueShow = this.valueSS + "_ _ _";
          break;
      case 4:
          this.valueShow = this.valueSS + "_ _";
          break;
      case 5:
          this.valueShow = this.valueSS + "_";
          break;
      case 6:
          this.valueShow = this.valueSS;
          break;            
      default:
        this.valueShow = "_ _ _ _ _ _";
        break;
    }
    this.valueSS;

    
  }

}
