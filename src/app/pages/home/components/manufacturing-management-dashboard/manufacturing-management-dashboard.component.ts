import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DATE_LOCALE, MatDateFormats, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BaseClass } from '../../../../commons/base.class';
import { GET_LOG_MANUFACTURING_DASHBOARD } from '../../../../commons/queries/dashboard.query';
import {
  LogManufacturingDashboardInput,
  LogManufacturingDashboardResponse,
  LogManufacturingDashboardTimelinePoint,
} from '../../../../commons/types';
import { ApiService } from '../../../../core/services/api.service';

const VI_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: { day: '2-digit', month: '2-digit', year: 'numeric' },
  },
  display: {
    dateInput: { day: '2-digit', month: '2-digit', year: 'numeric' },
    monthYearLabel: { month: 'long', year: 'numeric' },
    dateA11yLabel: { day: '2-digit', month: 'long', year: 'numeric' },
    monthYearA11yLabel: { month: 'long', year: 'numeric' },
  },
};

@Component({
  selector: 'app-manufacturing-management-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'vi-VN' },
    ...provideNativeDateAdapter(VI_DATE_FORMATS),
  ],
  templateUrl: './manufacturing-management-dashboard.component.html',
  styleUrl: './manufacturing-management-dashboard.component.scss',
})
export class ManufacturingManagementDashboardComponent extends BaseClass {
  dashboard: LogManufacturingDashboardResponse | null = null;
  loadFailed = false;
  private useDefault24HourRange = true;

  readonly bucketOptions = [
    { value: 15, name: '15 phút' },
    { value: 30, name: '30 phút' },
    { value: 60, name: '1 giờ' },
    { value: 120, name: '2 giờ' },
    { value: 360, name: '6 giờ' },
  ];

  override readonly filterForm = new FormGroup({
    fromDate: new FormControl<Date | null>(new Date(Date.now() - 24 * 60 * 60 * 1000)),
    toDate: new FormControl<Date | null>(new Date()),
    bucketMinutes: new FormControl<number | null>(15),
  });

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();
    await this.onLoadDashboard();
  }

  async onLoadDashboard(): Promise<void> {
    const formValue = this.filterForm.getRawValue();
    const input: LogManufacturingDashboardInput = {
      bucketMinutes: formValue.bucketMinutes ?? 15,
    };

    if (!this.useDefault24HourRange) {
      if (!formValue.fromDate || !formValue.toDate) {
        this.commonService.openSnackBarError('Vui lòng chọn đầy đủ khoảng ngày');
        return;
      }

      input.fromTime = this.toStartOfDay(formValue.fromDate);
      input.toTime = this.toEndOfDay(formValue.toDate);
    }

    this.loadFailed = false;
    const response = await this.injector.get(ApiService).executeQuery(GET_LOG_MANUFACTURING_DASHBOARD, { input });

    this.dashboard = response?.logManufacturingDashboard ?? null;
    this.loadFailed = !this.dashboard;
  }

  async onResetFilters(): Promise<void> {
    const now = new Date();
    this.useDefault24HourRange = true;
    this.filterForm.reset({
      fromDate: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      toDate: now,
      bucketMinutes: 15,
    });
    await this.onLoadDashboard();
  }

  onDateRangeChanged(): void {
    this.useDefault24HourRange = false;
  }

  formatNumber(value: number | null | undefined): string {
    return (value ?? 0).toLocaleString('vi-VN');
  }

  formatRate(value: number | null | undefined): string {
    return `${(value ?? 0).toLocaleString('vi-VN', { maximumFractionDigits: 2 })}%`;
  }

  formatDateTime(timestamp: number | null | undefined): string {
    if (!timestamp) return '-';
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(timestamp));
  }

  getTimelinePercent(
    point: LogManufacturingDashboardTimelinePoint,
    value: number,
  ): number {
    return this.getPercent(value, point.totalAttempts);
  }

  getPercent(value: number, total: number): number {
    return total > 0 ? (value / total) * 100 : 0;
  }

  getStatusClass(status: string): string {
    if (status === 'PASS') return 'bg-green-100 text-green-800';
    if (status === 'FAIL') return 'bg-red-100 text-red-800';
    return 'bg-amber-100 text-amber-800';
  }

  getStatusLabel(status: string): string {
    if (status === 'PASS') return 'Đạt';
    if (status === 'FAIL') return 'Lỗi';
    return 'Đang chờ';
  }

  private toStartOfDay(value: Date): number {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  }

  private toEndOfDay(value: Date): number {
    const date = new Date(value);
    date.setHours(23, 59, 59, 999);
    return date.getTime();
  }
}
