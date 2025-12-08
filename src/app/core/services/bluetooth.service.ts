import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BluetoothService {
  constructor() {}
  /**
   * Check if the Bluetooth API is supported
   * @returns true if the Bluetooth API is supported, false otherwise
   */
  isBluetoothApiSupported(): boolean {
    return !!(navigator as any).bluetooth;
  }

  /**
   * Start scanning for Bluetooth devices
   */
  async startScanning(options: any): Promise<void> {
    try {
      console.log('options', options);
      const device = await (navigator as any).bluetooth.requestLEScan({
        ...options
      });
      console.log('device', device);
    } catch (error) {
      console.error('Error scanning for devices:', error);
      throw error;
    } finally {
    }
  }

  anyDevice() {
    // This is the closest we can get for now to get all devices.
    // https://github.com/WebBluetoothCG/web-bluetooth/issues/234
    return Array.from(
      '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    )
      .map((c) => ({ namePrefix: c }))
      .concat({ namePrefix: '' });
  }
}
