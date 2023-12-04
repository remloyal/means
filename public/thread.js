

// hid-process.js
const HID = require('node-hid');
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
    process.parentPort.postMessage({ event: 'hidError', data: error });
  }
});
const createHid = path => {
  if (path) {
    device = new HID.HID(path);
    device.on('data', res => {
      const todo = Uint8ArrayToString(res);
      process.parentPort.postMessage({ event: 'hidData', data: { key: item.key, value: todo } });
    });
    device.on('error', err => {
      process.parentPort.postMessage({ event: 'hidError', data: err });
    });
  }
};
function Uint8ArrayToString(fileData) {
  var dataString = '';
  for (var i = 0; i < fileData.length; i++) {
    dataString += String.fromCharCode(fileData[i]);
  }
  console.log(dataString);
  return dataString.replace('\u0002', '').replaceAll('\u0000', '');
}

process.parentPort.once('error', err => {
  console.error('子进程发生错误:', err);
  process.parentPort.postMessage({ event: 'error', data: err });
});


