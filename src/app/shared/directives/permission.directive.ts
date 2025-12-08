import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { CommonService } from '../../core/services/common.service';
import { storageKey } from '../../core/constants/storage-key';

@Directive({
  selector: '[permission]'
})
export class PermissionDirective {
  permissions: string[] = [];
  @Input()
  set permission(value: string[]) {
    this.permissions = value;
    this.updateView();
  }
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private commonService: CommonService
  ) { }

  updateView() {
    const permissions = JSON.parse(localStorage.getItem(storageKey.permissions) || '[]');
    const hasPermission = this.permissions?.some((permission: string) => permissions.includes(permission));
    this.viewContainer.clear();
    if (hasPermission) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}
