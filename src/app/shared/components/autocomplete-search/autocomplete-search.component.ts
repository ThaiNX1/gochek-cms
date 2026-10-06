import { CommonModule } from '@angular/common';
import { Component, ContentChild, EventEmitter, Input, OnChanges, Optional, Output, Self, SimpleChanges, TemplateRef } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-autocomplete-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './autocomplete-search.component.html',
  styleUrls: ['./autocomplete-search.component.scss'],
})
export class AutocompleteSearchComponent implements ControlValueAccessor, OnChanges {
  /** Danh sách option đầy đủ để filter local */
  @Input() options: any[] = [];
  /** Key lấy giá trị để binding (mặc định: 'id') */
  @Input() valueKey: string = 'id';
  /** Key hiển thị label (mặc định: 'name') */
  @Input() labelKey: string = 'name';
  /** Các key phụ thêm vào chuỗi tìm kiếm (ngoài valueKey + labelKey) */
  @Input() searchKeys: string[] = [];
  /** Placeholder input */
  @Input() placeholder: string = 'Tìm kiếm...';
  /** Đang loading (hiển thị spinner thay icon search) */
  @Input() loading: boolean = false;
  /** Cho phép xóa giá trị đã chọn */
  @Input() clearable: boolean = true;
  /** Custom template cho mỗi option, nhận context $implicit = option object */
  @Input() optionTemplate?: TemplateRef<any>;
  /** ContentChild: dùng khi truyền <ng-template #optionTemplate> bên trong thẻ component */
  @ContentChild('optionTemplate') optionTemplateChild?: TemplateRef<any>;

  get resolvedOptionTemplate(): TemplateRef<any> | undefined {
    return this.optionTemplateChild ?? this.optionTemplate;
  }

  /** Emit option object được chọn */
  @Output() selected = new EventEmitter<any>();
  /** Emit khi người dùng xóa giá trị */
  @Output() cleared = new EventEmitter<void>();

  /** Control nội bộ cho input text hiển thị */
  readonly searchControl = new FormControl<string>('');
  /** Danh sách option sau khi filter */
  filteredOptions: any[] = [];

  private _value: any = null;
  private onChange: (v: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(@Optional() @Self() public ngControl: NgControl) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options']) {
      this.filteredOptions = [...(this.options ?? [])];
      // Nếu đang có value, sync lại label trong input
      if (this._value != null) {
        const matched = this.options.find(o => o[this.valueKey] === this._value);
        if (matched) {
          this.searchControl.setValue(this.getLabel(matched), { emitEvent: false });
        }
      }
    }
  }

  // ─── ControlValueAccessor ────────────────────────────────────────────────

  writeValue(value: any): void {
    this._value = value;
    const matched = this.options.find(o => o[this.valueKey] === value);
    this.searchControl.setValue(matched ? this.getLabel(matched) : '', { emitEvent: false });
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }

  setDisabledState(isDisabled: boolean): void {
    isDisabled ? this.searchControl.disable() : this.searchControl.enable();
  }

  // ─── Handlers ────────────────────────────────────────────────────────────

  onInputChange(keyword: string): void {
    const q = (keyword ?? '').trim().toLowerCase();
    this.filteredOptions = q
      ? this.options.filter(o => this.buildSearchString(o).includes(q))
      : [...this.options];

    // Nếu người dùng xóa hết text thì reset value
    if (!keyword) {
      this._value = null;
      this.onChange(null);
    }
  }

  onOptionSelected(option: any): void {
    this._value = option[this.valueKey];
    this.searchControl.setValue(this.getLabel(option), { emitEvent: false });
    this.onChange(this._value);
    this.onTouched();
    this.selected.emit(option);
  }

  onClear(event: MouseEvent): void {
    event.stopPropagation();
    this._value = null;
    this.searchControl.setValue('', { emitEvent: false });
    this.filteredOptions = [...this.options];
    this.onChange(null);
    this.onTouched();
    this.cleared.emit();
  }

  onBlur(): void {
    this.onTouched();
    // Nếu blur mà text không khớp với option nào → giữ nguyên value cũ, restore label
    const matched = this.options.find(o => o[this.valueKey] === this._value);
    this.searchControl.setValue(matched ? this.getLabel(matched) : '', { emitEvent: false });
    this.filteredOptions = [...this.options];
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  getLabel(option: any): string {
    return option?.[this.labelKey] ?? option?.[this.valueKey] ?? '';
  }

  private buildSearchString(option: any): string {
    const keys = [this.valueKey, this.labelKey, ...this.searchKeys];
    return keys.map(k => String(option[k] ?? '')).join(' ').toLowerCase();
  }

  get hasValue(): boolean {
    return this._value != null && this._value !== '';
  }

  get isInvalid(): boolean {
    return !!(this.ngControl?.invalid && this.ngControl?.touched);
  }
}
