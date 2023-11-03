interface DeviceType {
  interface: string;
  manufacturer: string;
  path: string;
  product: string;
  productId: string;
  release: string;
  serialNumber: string;
  usagePage: string;
  vendorId: string;
}

interface TimeType {
  timeStamp: string;
  c: number;
  f: number;
  humi: number;
}
