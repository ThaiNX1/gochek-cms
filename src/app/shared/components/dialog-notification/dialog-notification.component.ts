import { Component, Inject, Input, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface DialogNotificationData {
  title: string;
  message?: string;
  width?: string;
  height?: string;
  showCloseButton?: boolean;
  showActions?: boolean;
  confirmText?: string;
  cancelText?: string;
  align?: 'start' | 'end' | 'center';
  type?: 'default' | 'warning' | 'error' | 'success';
}

@Component({
  selector: 'app-dialog-notification',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './dialog-notification.component.html',
  styleUrls: ['./dialog-notification.component.scss']
})
export class DialogNotificationComponent {
  @Input() content?: TemplateRef<any>;

  constructor(
    public dialogRef: MatDialogRef<DialogNotificationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogNotificationData
  ) {
    // Set default values
    this.data = {
      type: 'default',
      showCloseButton: true,
      showActions: true,
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      align: 'end',
      ...this.data
    };
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  getConfirmButtonColor() {
    switch (this.data.type) {
      case 'warning':
        return 'var(--yellow-500)';
      case 'error':
        return 'var(--red-500)';
      default:
        return 'var(--orange-500)';
    }
  }
} 
