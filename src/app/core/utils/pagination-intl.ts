import { MatPaginatorIntl } from "@angular/material/paginator";

export function CustomMatPaginatorIntl(): MatPaginatorIntl {
    const paginatorIntl = new MatPaginatorIntl();
  
    paginatorIntl.itemsPerPageLabel = 'Số lượng mỗi trang'; // <-- Your custom label
    paginatorIntl.nextPageLabel = 'Trang sau';
    paginatorIntl.previousPageLabel = 'Trang trước';
    paginatorIntl.firstPageLabel = 'Trang đầu';
    paginatorIntl.lastPageLabel = 'Trang cuối';
  
    return paginatorIntl;
  }