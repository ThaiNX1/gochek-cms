import { AfterViewInit, ChangeDetectorRef, Component, inject, Injector, OnDestroy, OnInit, QueryList, TemplateRef, ViewChild, ViewChildren } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { MatTable } from "@angular/material/table";
import { Subject } from "rxjs";
import { PermissionAction, PermissionEnum, TableColumnType } from "../core/constants/enum";
import { CommonService } from "../core/services/common.service";
import { MyTemplateDirective } from "../shared/directives/my-template.directive";
import { storageKey } from "../core/constants/storage-key";
import { DownloadService } from "../core/services/download.service";
@Component({
  template: '',
  standalone: true,
  imports: [],
  host: {
    class: 'flex-1 flex flex-col items-stretch justify-start overflow-auto'
  }
})
export abstract class BaseClass implements OnInit, AfterViewInit, OnDestroy {
  filterForm!: FormGroup;
  TableColumnType = TableColumnType;
  PermissionAction = PermissionAction;
  PermissionEnum = PermissionEnum;
  @ViewChild('table') table: MatTable<any> | undefined;
  @ViewChildren(MyTemplateDirective)
  templateRefList?: QueryList<MyTemplateDirective>;
  dataSource: any[] = [];
  columns: TableColumn[] = [];
  displayedColumns: any[] = [];
  pagination = {
    page: 1,
    size: 20,
    total: 0,
  };
  destroyRef = new Subject<void>();
  injector = inject(Injector);
  commonService = inject(CommonService);
  downloadService = inject(DownloadService);
  constructor() {
  }
  ngAfterViewInit(): void {
    this.displayedColumns =
      this.columns?.reduce((arr: any, _col) => {
        const _template = this.templateRefList?.find(
          (_tmp) => _tmp.tempCode === _col.templateCode
        );
        arr.push({
          ..._col,
          template: _template?.template,
        });
        return arr;
      }, []) || [];
    this.injector.get(ChangeDetectorRef).detectChanges();
    this.table?.updateStickyColumnStyles();
  }
  ngOnInit(): void {
  }
  ngOnDestroy(): void {
    this.destroyRef.next();
    this.destroyRef.complete();
  }

  hasPermission(permission: string[]) {
    const permissions = JSON.parse(localStorage.getItem(storageKey.permissions) || '[]');
    return permissions?.some((_permission: string) => permission.includes(_permission));
  }
}
export class TableColumn {
  name?: string;
  field?: string;
  className?: string;
  tdClassName?: string;
  templateCode?: string;
  template?: TemplateRef<any>
  sticky?: boolean;
  stickyEnd?: boolean;
  type?: TableColumnType;
}
