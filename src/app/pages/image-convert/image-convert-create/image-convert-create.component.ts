import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { BaseClass } from '../../../commons/base.class';
import { CONVERT_BATCH_MUTATION, IMAGE_CONVERT_PROGRESS_SUBSCRIPTION } from '../../../commons/queries/image-convert.query';
import { ImageConvertProgress } from '../../../commons/types';
import { ApiService } from '../../../core/services/api.service';
import { DirectiveModule } from '../../../shared/directive.module';

@Component({
  selector: 'app-image-convert-create',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCardModule,
    RouterModule,
    DirectiveModule,
    ReactiveFormsModule,
  ],
  templateUrl: './image-convert-create.component.html',
  styleUrl: './image-convert-create.component.scss'
})
export class ImageConvertCreateComponent extends BaseClass implements OnInit, OnDestroy {
  uploadForm!: FormGroup;
  selectedFiles: File[] = [];
  maxFiles = 100;
  maxSizeBytes = 200 * 1024 * 1024; // 200MB
  currentProgress: ImageConvertProgress | null = null;
  progressSubscription: Subscription | null = null;
  isUploading = false;

  constructor(private router: Router) {
    super();
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.uploadForm = new FormGroup({
      prompt: new FormControl('Convert the uploaded image into a sharp, high-quality 3D render style with clean details, good depth, and realistic lighting. Fill the frame completely.'),
      width: new FormControl('2304'),
      height: new FormControl('1856'),
    });
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    if (this.progressSubscription) {
      this.progressSubscription.unsubscribe();
    }
  }

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;

    let newFiles: File[] = Array.from(files);

    // Filter valid files (images)
    const validFiles = newFiles.filter(file => file.type.startsWith('image/'));

    // Check max files limit
    if (this.selectedFiles.length + validFiles.length > this.maxFiles) {
      this.commonService.openSnackBarError(`Tối đa ${this.maxFiles} ảnh.`);
      // Only keep files up to max limit
      const remainingSlots = this.maxFiles - this.selectedFiles.length;
      if (remainingSlots > 0) {
        this.selectedFiles = [...this.selectedFiles, ...validFiles.slice(0, remainingSlots)];
      }
    } else {
      this.selectedFiles = [...this.selectedFiles, ...validFiles];
    }

    // Check total size
    const totalSize = this.selectedFiles.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > this.maxSizeBytes) {
      this.commonService.openSnackBarError(`Tổng dung lượng vượt quá 200MB.`);
      // Remove last added to meet condition or just reset
      this.selectedFiles = [];
    }

    // Reset input value to allow selecting same files again if needed
    event.target.value = '';
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  getTotalSize(): number {
    return this.selectedFiles.reduce((sum, file) => sum + file.size, 0);
  }

  async onUpload(): Promise<void> {
    if (this.selectedFiles.length === 0) {
      this.commonService.openSnackBarError('Vui lòng chọn ít nhất 1 ảnh');
      return;
    }

    const totalSize = this.getTotalSize();
    if (totalSize > this.maxSizeBytes) {
      this.commonService.openSnackBarError('Tổng dung lượng vượt quá 200MB');
      return;
    }

    this.isUploading = true;

    // Prepare input according to ImageConvertBatchInput
    const input: any = {
      images: this.selectedFiles,
    };
    if (this.uploadForm.value.prompt) input.prompt = this.uploadForm.value.prompt;
    if (this.uploadForm.value.width) input.width = parseInt(this.uploadForm.value.width, 10);
    if (this.uploadForm.value.height) input.height = parseInt(this.uploadForm.value.height, 10);

    try {
      const apiService = this.injector.get(ApiService);

      // Bước 1: Gọi mutation để lấy jobId
      const response = await apiService.executeMutation<any>(
        CONVERT_BATCH_MUTATION,
        { input },
        true
      );

      const resultData = response?.convertBatch;

      if (resultData && resultData.jobId) {
        this.commonService.openSnackBar('Đã tải lên và bắt đầu xử lý');
        this.selectedFiles = [];
        this.uploadForm.reset();

        // Bước 2: Subscribe NGAY sau khi có jobId (trước khi job tiến triển)
        this.downloadService.triggerDownload(
          '',
          ``,
          IMAGE_CONVERT_PROGRESS_SUBSCRIPTION,
          { jobId: resultData.jobId },
          'imageConvertProgress'
        );
      } else {
        this.commonService.openSnackBarError('Lỗi xử lý file upload.');
        this.isUploading = false;
      }
    } catch (e: any) {
      console.error(e);
      this.commonService.openSnackBarError('Tải lên thất bại');
      this.isUploading = false;
    }
  }

  formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }
}
