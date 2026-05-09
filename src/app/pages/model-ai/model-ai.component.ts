import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { takeUntil } from 'rxjs';
import { UPLOAD_FILE } from '../../commons/queries/common.query';
import { BaseClass } from '../../commons/base.class';
import { constant } from '../../core/constants/constant';
import { ApiService } from '../../core/services/api.service';
import { TtsStreamService } from '../../core/services/tts-stream.service';
import { SttStreamService } from '../../core/services/stt-stream.service';

@Component({
  selector: 'app-model-ai',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatSelectModule,
  ],
  templateUrl: './model-ai.component.html',
  styleUrl: './model-ai.component.scss',
})
export class ModelAiComponent extends BaseClass implements OnDestroy {

  // === Tab ===
  activeTab = 0;

  // === TTS ===
  generateForm = new FormGroup({
    text: new FormControl('', [Validators.required]),
  });
  isGenerating = false;
  isUploading = false;
  audioUrl: string | null = null;
  audioBlob: Blob | null = null;
  uploadedUrl: string | null = null;
  errorMessage: string | null = null;
  private currentAudioUrl: string | null = null;

  // === STT ===
  sttForm = new FormGroup({
    language: new FormControl('vi', [Validators.required]),
    model: new FormControl('general', [Validators.required]),
  });
  sttConnected = false;
  sttConnecting = false;
  sttStreaming = false;
  sttResult = '';
  sttError: string | null = null;
  micPermissionGranted = false;

  languageOptions = [
    { value: 'vi', label: 'Tiếng Việt' },
    { value: 'en', label: 'English' },
    { value: 'ja', label: '日本語' },
    { value: 'zh', label: '中文' },
  ];

  modelOptions = [
    { value: 'general', label: 'General' },
    { value: 'phone_call', label: 'Phone Call' },
    { value: 'meeting', label: 'Meeting' },
  ];

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();
    const sttService = this.injector.get(SttStreamService);

    // Subscribe state changes
    sttService.state$.pipe(takeUntil(this.destroyRef)).subscribe(state => {
      this.sttConnected = state.connected;
      this.sttConnecting = state.connecting;
      this.sttStreaming = state.streaming;
      this.micPermissionGranted = state.micGranted;
      this.sttError = state.error;
    });

    // Subscribe STT results
    sttService.result$.pipe(takeUntil(this.destroyRef)).subscribe(result => {
      if (result.isFinal) {
        this.sttResult += result.text + '\n';
      } else {
        console.log('[STT] Partial:', result.text);
      }
    });
  }

  // ===================== TTS =====================

  async onGenerate() {
    this.generateForm.markAllAsTouched();
    if (this.generateForm.invalid) {
      this.commonService.openSnackBarError('Vui lòng nhập nội dung văn bản');
      return;
    }

    this.isGenerating = true;
    this.errorMessage = null;
    this.uploadedUrl = null;

    if (this.currentAudioUrl) {
      this.injector.get(TtsStreamService).revokeUrl(this.currentAudioUrl);
      this.currentAudioUrl = null;
    }
    this.audioUrl = null;
    this.audioBlob = null;

    try {
      const result = await this.injector.get(TtsStreamService).stream(
        this.generateForm.value.text!
      );
      this.audioUrl = result.audioUrl;
      this.audioBlob = result.audioBlob;
      this.currentAudioUrl = result.audioUrl;
      this.commonService.openSnackBar('Tạo audio thành công');
    } catch (err: any) {
      this.errorMessage = err?.message ?? 'Tạo audio thất bại';
      this.commonService.openSnackBarError(this.errorMessage!);
    } finally {
      this.isGenerating = false;
    }
  }

  downloadAudio() {
    if (!this.audioBlob) return;
    const a = document.createElement('a');
    a.href = this.audioUrl!;
    a.download = `tts_${Date.now()}.mp3`;
    a.click();
  }

  async onUploadToS3() {
    if (!this.audioBlob) {
      this.commonService.openSnackBarError('Chưa có file audio để upload');
      return;
    }

    this.isUploading = true;
    try {
      const fileName = `tts_${Date.now()}.mp3`;
      const file = new File([this.audioBlob], fileName, { type: 'audio/mpeg' });

      const response = await this.injector.get(ApiService).executeMutation(UPLOAD_FILE, {
        file,
        folder: constant.fileFolder.audios,
      });

      if (response?.uploadFile) {
        this.uploadedUrl = response.uploadFile?.url || '';
        this.commonService.openSnackBar('Upload S3 thành công');
      } else {
        this.commonService.openSnackBarError('Upload S3 thất bại');
      }
    } catch (err: any) {
      this.commonService.openSnackBarError(err?.message ?? 'Upload S3 thất bại');
    } finally {
      this.isUploading = false;
    }
  }

  // ===================== STT =====================

  async onRequestMicPermission() {
    const granted = await this.injector.get(SttStreamService).requestMicPermission();
    if (granted) {
      this.commonService.openSnackBar('Đã cấp quyền microphone');
    } else {
      this.commonService.openSnackBarError('Không thể truy cập microphone');
    }
  }

  onConnectSttSocket() {
    this.injector.get(SttStreamService).connect();
  }

  async onStartStream() {
    this.sttForm.markAllAsTouched();
    if (this.sttForm.invalid) return;

    try {
      await this.injector.get(SttStreamService).startStream(
        this.sttForm.value.language!,
        this.sttForm.value.model!,
      );
    } catch (err: any) {
      this.commonService.openSnackBarError(err?.message ?? 'Không thể bắt đầu ghi âm');
    }
  }

  onStopStream() {
    this.injector.get(SttStreamService).stopStream();
  }

  onDisconnectSttSocket() {
    this.injector.get(SttStreamService).disconnect();
  }

  onClearSttResult() {
    this.sttResult = '';
  }

  // ===================== Lifecycle =====================

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    if (this.currentAudioUrl) {
      this.injector.get(TtsStreamService).revokeUrl(this.currentAudioUrl);
    }
    this.injector.get(SttStreamService).destroy();
  }
}
