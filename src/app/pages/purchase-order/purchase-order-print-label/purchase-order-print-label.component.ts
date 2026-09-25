import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { QRCodeModule } from 'angularx-qrcode';

@Component({
  selector: 'app-purchase-order-print-label',
  standalone: true,
  imports: [CommonModule, QRCodeModule],
  templateUrl: './purchase-order-print-label.component.html',
  styleUrl: './purchase-order-print-label.component.scss'
})
export class PurchaseOrderPrintLabelComponent implements OnInit, OnDestroy {
  sessionId: string | null = null;
  labels: any[] = [];
  isLoading = true;
  printData: any = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.sessionId = params['session'];
      
      if (this.sessionId) {
        this.loadData();
      } else {
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    // Optionally clean up localStorage to not leak space, but maybe keep it for reloading
    // if (this.sessionId) {
    //   localStorage.removeItem(this.sessionId);
    // }
  }

  loadData() {
    this.isLoading = true;
    try {
      const dataStr = localStorage.getItem(this.sessionId!);
      if (dataStr) {
        this.printData = JSON.parse(dataStr);
        this.buildLabels();
      } else {
        console.error('Không tìm thấy dữ liệu in trong localStorage');
      }
    } catch (error) {
      console.error('Error loading print data', error);
    } finally {
      this.isLoading = false;
      
      // Delay printing to allow images to load
      setTimeout(() => {
        if (this.labels.length > 0) {
          window.print();
        }
      }, 1000);
    }
  }

  private buildLabels() {
    const { poData, shipment, batches, totalPoQty } = this.printData;
    this.labels = [];
    
    // Create one label per batch in the shipment
    batches.forEach((batch: any) => {
      const model = poData.items?.find((item: any) => item.model?.id === batch.modelId || item.model?.code === batch.modelCode) || {};
      
      this.labels.push({
        poNo: poData.poNumber,
        orderDate: this.formatDate(poData.orderDate),
        deliveryDate: this.formatDate(poData.requestedDeliveryDate),
        product: model.modelName || model.model?.name || batch.product || '-',
        model: model.modelCode || model.model?.code || batch.modelCode || '-',
        color: model.color || 'White',
        hwVersion: batch.hardwareVersion || '-',
        fwVersion: batch.firmwareVersion || '-',
        totalPoQty: totalPoQty,
        factory: poData.supplier?.name || '-',
        destination: this.getShipmentNoteValue(shipment.note, 'Kho nhận') || shipment.receivingWarehouseName || 'Kho Việt Nam - Hà Nội',
        
        batchCode: batch.batchCode,
        plannedQty: batch.orderedQuantity,
        actualQty: batch.generatedQuantity || 0,
        productionDate: this.formatDate(batch.plannedProductionDate),
        line: '-', 
        qcStatus: 'PASSED',
        
        shipmentNo: shipment.shipmentCode,
        shipDate: this.formatDate(shipment.expectedShipDate),
        eta: this.formatDate(shipment.expectedArrivalDate),
        carrier: shipment.carrier || '-',
        containerNo: shipment.trackingNumber || '-',
        route: '-',
        palletNo: '-',
        cartonNo: '-'
      });
    });
  }
  
  private formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}/${d.getFullYear()}`;
  }
  
  private getShipmentNoteValue(note: string | null | undefined, label: string): string {
    if (!note) return '';
    const part = note.split('|').map(v => v.trim()).find(v => v.startsWith(`${label}:`));
    return part ? part.slice(label.length + 1).trim() : '';
  }

}
