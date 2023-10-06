import { Component, OnInit } from '@angular/core';
import { DiscoveredDevice } from '../types/discovered-device.type';
import {
  BleClient,
  RequestBleDeviceOptions,
  ScanMode,
} from '@capacitor-community/bluetooth-le';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page implements OnInit {
  constructor() {}

  isBluetoothAlertOpen = false;
  bluetoothAlertButtons = ['OK'];
  discoveredDevices: DiscoveredDevice[] = [];

  ngOnInit() {
    BleClient.initialize()
      .then(() => {
        console.log('BLE plugin initialized');
      })
      .catch((error) => {
        console.error('Error initializing BLE plugin', error);
      });
  }

  setBluetoothAlertOpen(isOpen: boolean) {
    this.isBluetoothAlertOpen = isOpen;
  }

  async connectToMTechDevice() {
    const HEART_RATE_SERVICE = '0000180d-0000-1000-8000-00805f9b34fb';
    const HEART_RATE_MEASUREMENT_CHARACTERISTIC =
      '00002a37-0000-1000-8000-00805f9b34fb';
    const BODY_SENSOR_LOCATION_CHARACTERISTIC =
      '00002a38-0000-1000-8000-00805f9b34fb';

    const device = await BleClient.requestDevice({
      services: [HEART_RATE_SERVICE],
    });

    // connect to device, the onDisconnect callback is optional
    BleClient.connect(device.deviceId, () => {
      console.log('Disconnected to MTech device');
    });
    console.log('Connected to MTech device');

    const result = await BleClient.read(
      device.deviceId,
      HEART_RATE_SERVICE,
      BODY_SENSOR_LOCATION_CHARACTERISTIC
    );
    console.log('MTech Device Body Sensor Service Response', result.getUint8(0));

    await BleClient.startNotifications(
      device.deviceId,
      HEART_RATE_SERVICE,
      HEART_RATE_MEASUREMENT_CHARACTERISTIC,
      (value) => {
        console.log('MTech Device Heart Rate Service Response', this.parseHeartRate(value));
      }
    );
  }

  clearDevices() {
    this.discoveredDevices = [];
  }

  parseHeartRate(value: DataView): number {
    const flags = value.getUint8(0);
    const rate16Bits = flags & 0x1;
    let heartRate: number;
    if (rate16Bits > 0) {
      heartRate = value.getUint16(1, true);
    } else {
      heartRate = value.getUint8(1);
    }
    return heartRate;
  }

  async discoverDevices() {
    const isBluetoothEnabled = await BleClient.isEnabled();
    // Ask to turn Bluetooth on
    if (!isBluetoothEnabled) {
      this.setBluetoothAlertOpen(true);
      return;
    }

    const requestOptions: RequestBleDeviceOptions = {
      allowDuplicates: false,
      scanMode: ScanMode.SCAN_MODE_BALANCED,
    };

    try {
      // Discover devices
      await BleClient.requestLEScan(requestOptions, (data) => {
        console.log('Discovered device', data);
        this.discoveredDevices.push({
          deviceId: data.device.deviceId,
          name: data.device.name,
          manufacturerData: data.manufacturerData,
          rawAdvertisement: data.rawAdvertisement,
          serviceData: data.serviceData,
          uuids: data.device.uuids,
        });
      });

      //Stop Scanning after getting devices
      setTimeout(async () => {
        await BleClient.stopLEScan();
        console.log('Stopped scanning');
      }, 5000);
    } catch (error) {
      console.error(error);
    }
  }
}
