import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-price-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './price-badge.component.html',
  styleUrls: ['./price-badge.component.scss'],
})
export class PriceBadgeComponent {
  @Input() price!: number;
  @Input() salePrice?: number;

  get discountPercent(): number {
    if (this.salePrice && this.price > this.salePrice) {
      return Math.round(((this.price - this.salePrice) / this.price) * 100);
    }
    return 0;
  }
}
