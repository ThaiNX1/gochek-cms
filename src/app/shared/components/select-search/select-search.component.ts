import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Injector, Input, Optional, Output, Self } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { CommonService } from '../../../core/services/common.service';

export interface SelectOption {
  value: any;
  label: string;
  [key: string]: any;
}

@Component({
  selector: 'app-select-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './select-search.component.html',
  styleUrls: ['./select-search.component.scss']
})
export class SelectSearchComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() options: any[] = [];
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() multiple: boolean = false;
  @Input() searchable: boolean = true;
  @Input() displayWith: ((value: any) => string) | null = null;
  @Input() valueKey: string = 'value';
  @Input() labelKey: string = 'label';
  @Input() searchQuery?: any;
  @Input() searchDataKey?: string;
  @Input() searchObject?: any;
  @Input() clearable: boolean = true;
  @Input() matLabel: string = '';
  @Input() paginationSearch: boolean = false;

  @Output() selected = new EventEmitter<SelectOption>();

  formControl = new FormControl('');
  searchControl = new FormControl('');
  filteredOptions: SelectOption[] = [];
  isLoading: boolean = false;
  private initialOptions: SelectOption[] = [];

  private _value: any;
  private onChange: any = () => { };
  private onTouched: any = () => { };

  constructor(
    private injector: Injector,
    @Optional() @Self() public ngControl: NgControl
  ) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(value => {
        if (this.searchQuery) {
          if (value?.length) {
            this.isLoading = true;
            this.injector.get(CommonService).setRemoveShowGlobalLoading(true)
            this.injector.get(ApiService).executeQuery(this.searchQuery, {
              ...(this.paginationSearch
                ? { pagination: { page: 1, size: 20, keyword: value } }
                : {
                  page: 1,
                  size: 20,
                  keyword: value
                }),
              ...(this.searchObject || {})
            }).then((response: any) => {
              this.isLoading = false;
              this.injector.get(CommonService).setRemoveShowGlobalLoading(false)
              this.options = response?.[this.searchDataKey || 'items']?.data || [];
            }).catch((error: any) => {
              this.isLoading = false;
              this.injector.get(CommonService).setRemoveShowGlobalLoading(false)
            });
          }
        } else {
          if (!this.initialOptions.length) {
            this.initialOptions = [...this.options];
          }
          if (value) {
            const searchTerm = value.toLowerCase();
            this.options = this.initialOptions.filter(option =>
              option[this.labelKey].toLowerCase().includes(searchTerm)
            );
          } else {
            this.options = [...this.initialOptions];
          }
        }
      });
  }

  get value(): any {
    return this._value;
  }

  set value(val: any) {
    this._value = val;
    this.formControl.setValue(val);
    this.onChange(val);
    this.onTouched();
  }

  writeValue(value: any): void {
    this._value = value;
    this.formControl.setValue(value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onValueChange(value: any) {
    this.value = value;
    const _selected = this.options.find(option => option[this.valueKey] === value);
    this.selected.emit(_selected);
  }

  getDisplayValue(option: SelectOption): string {
    if (this.displayWith) {
      return this.displayWith(option[this.valueKey]);
    }
    return option[this.labelKey];
  }

  clearSearch() {
    this.searchControl.setValue('');
  }

  clearSelectedValue() {
    this.formControl.setValue(null);
    this.onChange(null);
    this.onTouched();
  }
} 