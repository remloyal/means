import { BrowserWindow } from 'electron';
import { WebUSB, usb, findByIds } from 'usb';

let win: BrowserWindow | null = null;
const VERSION_ID = 10473; // 1003
const PRODUCT_ID = 631; // 517

usb.on('attach', async function (device) {
  if (
    device.deviceDescriptor.idProduct === PRODUCT_ID &&
    device.deviceDescriptor.idVendor === VERSION_ID
  ) {
    win?.webContents.send('deviceInsertion', device);
  }
});

usb.on('detach', function (device) {
  // console.log('监听到 usb 设备拔出：', device);
  if (
    device.deviceDescriptor.idProduct === PRODUCT_ID &&
    device.deviceDescriptor.idVendor === VERSION_ID
  ) {
    win?.webContents.send('deviceRemoval', device);
  } else {
    win?.webContents.send('deviceRemoval', false);
  }
});

export const deviceInit = async (browserWindow: BrowserWindow) => {
  win = browserWindow;
  const customWebUSB = new WebUSB({
    // Bypass cheking for authorised devices
    allowAllDevices: true,
  });
  const devices = await customWebUSB.getDevices();
  for (const device of devices) {
    if (device.vendorId === VERSION_ID && device.productId === PRODUCT_ID) {
      // console.log(device); // WebUSB device
      setTimeout(() => {
        win?.webContents.send('deviceInsertion', device);
      }, 5000);
    }
  }
  win.webContents.on('select-bluetooth-device', (event, deviceList, callback) => {
    event.preventDefault();
    console.log('deviceList', deviceList);
  });
};
