import { Component, OnInit } from '@angular/core';
import { BluetoothLE } from '@awesome-cordova-plugins/bluetooth-le';
import { concat } from 'rxjs';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
})
export class Tab2Page implements OnInit {
  constructor() {}

  isBluetoothAlertOpen = false;
  bluetoothAlertButtons = ['OK'];

  ngOnInit() {
    concat(
      BluetoothLE.initialize({
        request: true,
        statusReceiver: false,
        restoreKey: 'mtechbluetoothle',
      }),
      BluetoothLE.initializePeripheral({
        request: true,
        restoreKey: 'mtechbluetoothleperipheral',
      })
    ).subscribe(() => console.log('BLE Peripheral initialized'));
  }

  async advertiseDevice() {
    const isBluetoothEnabled = await BluetoothLE.isEnabled();
    if (!isBluetoothEnabled) {
      this.setBluetoothAlertOpen(true);
      return;
    }

    //Advertise device
    await BluetoothLE.startAdvertising({
      service: '180D',
      name: 'MTech Amino Mobile',
      connectable: true,
      includeDeviceName: true,
      includeTxPowerLevel: true,
    });
  }

  setBluetoothAlertOpen(isOpen: boolean) {
    this.isBluetoothAlertOpen = isOpen;
  }
}
