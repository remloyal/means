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
let timeout;
let bufferAll = [];
const createHid = path => {
  if (path) {
    device = new HID.HID(path);
    device.on('data', res => {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      bufferAll.push(res);
      timeout = setTimeout(() => {
        if (bufferAll.length > 1) {
          const buffer = [];
          bufferAll.forEach(item => {
            if (buffer.length > 0) {
              const list = [...item];
              //   list.shift();
              buffer.push(...list);
            } else {
              buffer.push(...item);
            }
          });
          const todo = Uint8ArrayToStr(new Uint8Array(buffer));
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
      }, 100);
    });
    device.on('error', err => {
      process.parentPort.postMessage({ event: 'hidError', data: err });
    });
  }
};
function Uint8ArrayToString(fileData) {
  let dataString = '';
  for (let i = 0; i < fileData.length; i++) {
    dataString += String.fromCharCode(fileData[i]);
  }
  console.log(dataString);
  return dataString.replace('\u0002', '').replaceAll('\u0000', '');
}
function Uint8ArrayToStr(fileData) {
  let dataString = '';
  for (let i = 0; i < fileData.length; i++) {
    dataString += String.fromCharCode(fileData[i]);
  }
  const decoder = new TextDecoder('utf8');
  const str = decoder.decode(fileData);
  console.log(str);
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
