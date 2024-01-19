const iconv = require('iconv-lite');

export const hidGbkKeys = [
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

/** 字符转GBK格式  buffer*/
export const toGBK = (str: string) => {
  const buffer = iconv.encode(str, 'GB2312');
  return [1, ...buffer];
};

/** gbk数据回显 */
export const toEchoGbk = fileData => {
  return iconv.decode(fileData, 'GB2312');
};
