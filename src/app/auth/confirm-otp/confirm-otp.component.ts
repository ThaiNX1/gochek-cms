import { CommonModule } from '@angular/common';
import { Component, Injector, OnDestroy, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { DirectiveModule } from '../../shared/directive.module';
import { MaterialModule } from '../../core/material.module';
import { ApiService } from '../../core/services/api.service';
import { CONFIRM_OTP, RESEND_OTP } from '../../core/constants/gqlqueries/authentication-query';
import { CommonService } from '../../core/services/common.service';

@Component({
  selector: 'app-confirm-otp',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    DirectiveModule,
    TranslateModule,
  ],
  templateUrl: './confirm-otp.component.html',
  styleUrl: './confirm-otp.component.scss'
})
export class ConfirmOtpComponent implements OnInit, OnDestroy {
  isLoading = signal(false);
  destroyRef = new Subject<void>();
  otpForm!: FormGroup;

  constructor(private readonly injector: Injector) { }

  ngOnDestroy(): void {
    this.destroyRef.next();
    this.destroyRef.complete();
  }

  ngOnInit(): void {
    this.otpForm = new FormGroup({
      number1: new FormControl(null, [Validators.required, Validators.minLength(1), Validators.maxLength(1)]),
      number2: new FormControl(null, [Validators.required, Validators.minLength(1), Validators.maxLength(1)]),
      number3: new FormControl(null, [Validators.required, Validators.minLength(1), Validators.maxLength(1)]),
      number4: new FormControl(null, [Validators.required, Validators.minLength(1), Validators.maxLength(1)]),
      number5: new FormControl(null, [Validators.required, Validators.minLength(1), Validators.maxLength(1)]),
      number6: new FormControl(null, [Validators.required, Validators.minLength(1), Validators.maxLength(1)]),
    });
  }

  async handleConfirmOtp() {
    this.otpForm.markAllAsTouched();
    if(this.otpForm.invalid){
      this.injector.get(CommonService).openSnackBar('Vui lòng nhập đầy đủ mã OTP','center');
      return;
    }
    const otp = [
      this.otpForm.value.number1,
      this.otpForm.value.number2,
      this.otpForm.value.number3,
      this.otpForm.value.number4,
      this.otpForm.value.number5,
      this.otpForm.value.number6,
    ].join('');
    this.isLoading.set(true);
    const response = await this.injector.get(ApiService).executeMutation(CONFIRM_OTP, {
      otp,
    });
    this.isLoading.set(false);
    if(response?.confirmOtp){
      this.injector.get(CommonService).openSnackBar('Mã OTP đã được xác thực','center');
      localStorage.clear();
      this.injector.get(Router).navigate(['/login']);
    }else{
      this.injector.get(CommonService).openSnackBar('Mã OTP không chính xác','center');
    }
  }

  async resendOtp() {
    this.isLoading.set(true);
    const response = await this.injector.get(ApiService).executeMutation(RESEND_OTP);
    this.isLoading.set(false);
    if(response?.resendOtp){
      this.injector.get(CommonService).openSnackBar('Mã OTP đã được gửi đến email của bạn','center');
    }
  }

  onInput(event: Event, nextInput: HTMLInputElement | null) {
    const input = event.target as HTMLInputElement;
    if (input.value.length === 1 && nextInput) {
      nextInput.focus();
    }
  }

}
