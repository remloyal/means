interface OperateType<T> {
  [key: string]: T;
}

interface OperateTypeItem {
  name: string;
  order: (string?) => string;
  getData: (data: string) => string | number | string[];
  key: string;
  param?: number | string;
}

interface DeviceInstanceType {
  device: any;
  deviceInfo: DeviceType | null;
  operate: OperateTypeItem | null;
  record: OperateType<any>;
  isComplete: boolean;
  actionList: OperateTypeItem[] | [];
  csvData: TimeType[];
  drive: any;
  initialize: () => void;
  init: (data: DeviceType) => void;
  write: (item: OperateTypeItem, param?: string | number) => void;
  getData: (key?: string) => Promise;
  close: () => void;
  setCsvData: (csvData: TimeType[]) => void;
}
