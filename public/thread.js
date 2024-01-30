// hid-process.js
const HID = require('node-hid');
const iconv = require('iconv-lite');

let device = null;
let item;
process.parentPort.on('message', async message => {
  const msg = message.data;
  try {
    if (!device) {
      await createHid(msg.data.path);
    }
    if (msg.event === 'hidWrite') {
      item = msg.data;
      device.write(msg.data.value);
    }
    if (msg.event === 'hidClose') {
      if (device != null) {
        device.close();
        device = null;
        console.log('关闭串口成功');
      }
    }
  } catch (error) {
    device && device.close();
    device = null;
    process.parentPort.postMessage({ event: 'hidError', data: error });
  }
});
let timeout;
let bufferAll = [];
const createHid = path => {
  if (path) {
    device = new HID.HID(path);
    device.on('data', res => {
      // 判断是否需要延时
      if (item.delayState) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        bufferAll.push(res);
        timeout = setTimeout(() => {
          if (bufferAll.length > 1) {
            const buffer = [];
            bufferAll.forEach(res => {
              if (buffer.length > 0) {
                const list = [...res];
                //   list.shift();
                buffer.push(...list);
              } else {
                buffer.push(...res);
              }
            });
            const todo = Uint8ArrayToString(new Uint8Array(buffer));
            bufferAll = [];
            process.parentPort.postMessage({
              event: 'hidData',
              data: { key: item.key, value: todo },
            });
          } else {
            const data = bufferAll[0];
            const todo = Uint8ArrayToString(data);
            bufferAll = [];
            process.parentPort.postMessage({
              event: 'hidData',
              data: { key: item.key, value: todo },
            });
          }
        }, item.delayTime || 150);
      } else {
        const todo = Uint8ArrayToString(res);
        process.parentPort.postMessage({
          event: 'hidData',
          data: { key: item.key, value: todo },
        });
      }
    });
    device.on('error', err => {
      device && device.close();
      device = null;
      process.parentPort.postMessage({ event: 'hidError', data: err });
    });
  }
};
function Uint8ArrayToString(fileData) {
  let dataString = '';
  for (let i = 0; i < fileData.length; i++) {
    dataString += String.fromCharCode(fileData[i]);
  }
  const decoder = new TextDecoder('utf8');
  let str = decoder.decode(fileData);
  console.log('解析数据 ==>', str);
  if (hidGbkKeys.includes(item.key)) {
    str = iconv.decode(fileData, 'GB2312');
  }
  return str
    .trim()
    .replaceAll('\u0002', '')
    .replaceAll('\u0000', '')
    .replaceAll('�', '')
    .replaceAll('', '');
}
process.parentPort.once('error', err => {
  console.error('子进程发生错误:', err);
  process.parentPort.postMessage({ event: 'error', data: err });
});

const hidGbkKeys = [
  'shipmentId',
  'setShipmentId',
  'shipment1',
  'setShipment1',
  'shipment2',
  'setShipment2',
  'shipment3',
  'setShipment3',
  'shipment4',
  'setShipment4',
  'shipment5',
  'setShipment5',
  'shipment6',
  'setShipment6',
  'shipment7',
  'setShipment7',
];
