import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { UTC_PARAM } from '../../config';

dayjs.extend(utc);
dayjs.extend(timezone);

const pdfData = (data, monitors, markList) => {
  const { record, param } = data;
  const deviceInfo = data.database;
  const bounded = dayjs(monitors.temp[monitors.temp.length - 1].timestamp).format(
    'YYYY-MM-DD HH:mm:ss:SSS'
  );
  const unit = param.tempUnit == '℃' ? 'cels' : 'fahr';
  const mold = record.batvol && record.batvol != '' ? 'device' : 'index';
  return {
    info: {
      filter: {
        generateType: 1,
        needInfo: false,
        needBtPrintnfo: false,
        needFilePath: false,
        downloadHost: '',
        sensors: param.data,
        pdfTimeInterval: 0,
        startTime: param.startTime,
        endTime: param.endTime,
        checkCompleteness: false,
        unit,
      },
      product: {
        alertStrategy: 1,
        hardwareVersion: record.hardwareVersion || 'M2MR21',
        pdfChartType: param.data.length == 1 ? 0 : 1,
        pdfLanguage: param.pdfTongue,
        pdfLogoColor: '',
        pdfLogoText: '',
        pdfMktShow: 1,
        pdfNameType: 2,
        pdfTemplateId: 0,
        pdfWebsite: '',
        referenceModel: '',
        alerts: [
          { type: 'temp', labelIndex: 0 },
          { type: 'humi', labelIndex: 0 },
        ],
      },
      order: {
        bounded,
        unbounded: bounded,
        unbindType: 3,
        stopMode: record.stopMode,
      },
      device: {
        terNo: record.getsn,
        usage: 1,
        firmwareVersion: record.firmwareVersion,
        model: record.deviceType,
        shipmentID: record.shipmentId || '',
        shipmentNote: record.shipment || '',
        params: {
          assetId: '',
          content: '',
          dc: '',
          freighter: 'AAAA',
          from: '-',
          pdfLanguage: param.pdfTongue,
          personal: '44',
          predicatedEnd: param.startTime,
          predicatedStart: param.endTime,
          projectId: '',
          recipient: '',
          startDelayTime: parseInt(record.startDelayTime) / 60,
          timeZone: record.timeZone.replace('UTC', '') || '+08:00',
          to: record.getsn,
          tripId: record.deviceType,
          vehicle: '',
          alerts: [
            {
              type: 'humi',
              unit: 'RH',
              min: parseFloat(record.lowHumi),
              receiveAlert: true,
              max: parseFloat(record.highHumi),
            },
            {
              type: 'temp',
              unit: param.tempUnit,
              min: parseFloat(param.lowtEmp),
              receiveAlert: true,
              max: parseFloat(param.hightEmp),
            },
          ],
          read: parseInt(record.tempPeriod) / 60,
          report: 10,
        },
      },
      customer: { name: 'frigga', filePath: data.filePath },
      markList: markList || [],
      mold,
    },
    monitors,
  };
};

export const setPdfData = async data => {
  const csvData = await data.csvData.filter(
    item => item.timeStamp >= data.param.startTime && item.timeStamp <= data.param.endTime
  );
  const monitors = await setMonitorData(csvData, data);
  const record = pdfData(data, monitors.record, monitors.markData);
  return record;
};
const format = 'YYYY-MM-DD HH:mm:ss';
// 定义一个名为setMonitorData的函数，接收data和param两个参数
const setMonitorData = (data, todo) => {
  const { param, database, record: information, markList = [] } = todo;
  const tempData: any = [];
  const tempDataF: any = [];
  const humiData: any = [];
  const record = {};
  const oldTimeZone = UTC_PARAM[database.timeZone];
  const newTimeZone = UTC_PARAM[information.timeZone];
  const timeZoneState = oldTimeZone == newTimeZone ? true : false;
  for (let index = 0; index < data.length; index++) {
    let time;
    const item = data[index];
    if (timeZoneState) {
      time = dayjs(item.timeStamp).valueOf();
    } else {
      const utcTime = dayjs.utc(item.timeStamp).utcOffset(database.timeZone.replace('UTC', ''));
      // console.log('utcTime ==>', utcTime.toString(), utcTime.format(format));
      const convertedTime = utcTime.tz(newTimeZone);
      // console.log('convertedTime ==>', convertedTime.toString(), convertedTime.format(format));
      // const time = convertedTime.valueOf();
      time = dayjs(convertedTime.format(format)).valueOf();
    }

    // 转换时区时间
    tempData.push({ timestamp: time, val: parseFloat(item.c), lbstime: time });
    humiData.push({ timestamp: time, val: parseFloat(item.humi), lbstime: time });
    tempDataF.push({ timestamp: time, val: parseFloat(item.humi), lbstime: time });
  }
  if (param.data.includes('temp')) {
    record['temp'] = tempData;
    // 如果param.tempUnit为℃，则将tempData添加到record中，否则将tempDataF添加到record中
    // record['temp'] = param.tempUnit == '℃' ? tempData : tempDataF;
  }
  if (param.data.includes('humi')) {
    record['humi'] = humiData;
  }
  const markData: any = [];
  if (markList.length > 0) {
    const markFilterList = markList.filter(
      item => item.timeStamp >= param.startTime && item.timeStamp <= param.endTime
    );

    for (let index = 0; index < markFilterList.length; index++) {
      const item = markFilterList[index];
      let time;
      if (timeZoneState) {
        time = dayjs(item.timeStamp).valueOf();
      } else {
        const utcTime = dayjs.utc(item.timeStamp).utcOffset(database.timeZone.replace('UTC', ''));
        const convertedTime = utcTime.tz(newTimeZone);
        time = dayjs(convertedTime.format(format)).valueOf();
      }
      // 转换时区时间
      markData.push({ timestamp: time, val: parseFloat(item.c), lbstime: time });
    }
  }
  return { record, markData };
};
// c : 25.2  f: 77.3  humi:  64 timeStamp :  "2023-11-09 20:07:19"
