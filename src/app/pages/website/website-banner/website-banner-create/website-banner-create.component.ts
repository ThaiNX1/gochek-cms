import { CommonModule } from '@angular/common';
import { Component, Injector, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { CREATE_WEBSITE_BANNER, GET_WEBSITE_BANNER, UPDATE_WEBSITE_BANNER } from '../../../../commons/queries/website.query';
import { WebsiteBanner, WebsiteBannerPageEnum } from '../../../../commons/types';
import { ApiService } from '../../../../core/services/api.service';
import { CommonService } from '../../../../core/services/common.service';

@Component({
  selector: 'app-website-banner-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatSelectModule,
  ],
  templateUrl: './website-banner-create.component.html',
  styleUrl: './website-banner-create.component.scss'
})
export class WebsiteBannerCreateComponent implements OnInit {
  bannerForm!: FormGroup;
  isEditMode = false;
  bannerId: string | null = null;
  imagePreview: string | null = null;
  imageFile: File | null = null;
  ownerPages = [
    { label: 'Trang chủ', value: WebsiteBannerPageEnum.HOME },
    { label: 'Học tập', value: WebsiteBannerPageEnum.LEARNING },
    { label: 'Giới thiệu', value: WebsiteBannerPageEnum.ABOUT },
    { label: 'Liên hệ', value: WebsiteBannerPageEnum.CONTACT },
  ]
  constructor(
    private injector: Injector,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.bannerForm = new FormGroup({
      title: new FormControl('', [Validators.required]),
      order: new FormControl(0, [Validators.required, Validators.min(0)]),
      isActive: new FormControl(true),
      redirectUrl: new FormControl(''),
      page: new FormControl(WebsiteBannerPageEnum.HOME, [Validators.required]),
    });

    this.bannerId = this.route.snapshot.paramMap.get('id');
    if (this.bannerId && this.bannerId !== 'create') {
      this.isEditMode = true;
      this.getBanner();
    }
  }

  async getBanner() {
    if (!this.bannerId) return;

    const response = await this.injector.get(ApiService).executeQuery<{ websiteBanner: WebsiteBanner }>(
      GET_WEBSITE_BANNER,
      { id: this.bannerId }
    );

    if (response?.websiteBanner) {
      const banner = response.websiteBanner;
      this.bannerForm.patchValue({
        title: banner.title,
        order: banner.order,
        isActive: banner.isActive,
        redirectUrl: banner.redirectUrl,
        page: banner.page,
      });
      this.imagePreview = banner.imageUrlCallback || null;
    }
  }

  onImageChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.injector.get(CommonService).openSnackBar('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.injector.get(CommonService).openSnackBarError('Vui lòng chọn file ảnh');
      return;
    }

    this.imageFile = file;

    // Preview image
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  removeImage() {
    this.imageFile = null;
    this.imagePreview = null;
  }

  async onSave() {
    if (this.bannerForm.invalid) {
      this.injector.get(CommonService).openSnackBar('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (!this.isEditMode && !this.imageFile) {
      this.injector.get(CommonService).openSnackBarError('Vui lòng chọn ảnh banner');
      return;
    }

    try {
      const input: any = {
        title: this.bannerForm.value.title,
        order: parseInt(this.bannerForm.value.order),
        isActive: this.bannerForm.value.isActive,
        redirectUrl: this.bannerForm.value.redirectUrl || '',
        page: this.bannerForm.value.page,
      };

      if (this.imageFile) {
        input.image = this.imageFile;
      }
      if (this.isEditMode && this.bannerId) {
        await this.injector.get(ApiService).executeMutation(UPDATE_WEBSITE_BANNER, {
          id: this.bannerId,
          input
        }, true);
        this.injector.get(CommonService).openSnackBar('Cập nhật banner thành công');
      } else {
        await this.injector.get(ApiService).executeMutation(CREATE_WEBSITE_BANNER, { input }, true);
        this.injector.get(CommonService).openSnackBar('Tạo banner thành công');
      }

      this.router.navigate(['/website/banner']);
    } catch (error) {
      this.injector.get(CommonService).openSnackBarError(
        this.isEditMode ? 'Cập nhật banner thất bại' : 'Tạo banner thất bại'
      );
    }
  }

  onCancel() {
    this.router.navigate(['/website/banner']);
  }
}
