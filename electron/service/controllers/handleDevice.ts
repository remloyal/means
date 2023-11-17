import dayjs from 'dayjs';
const pdfData = (data, monitors) => {
  const record = data.record;
  const param = data.param;
  const deviceInfo = data.database;
  const bounded = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss:SSS');
  const unit = param.tempUnit == '℃' ? 'cels' : 'fahr';
  return {
    info: {
      filter: {
        generateType: 1,
        archiveFolder: 'WEB/2022-12-13',
        needInfo: false,
        needBtPrintnfo: false,
        needFilePath: false,
        downloadHost: 'http://localhost:8090',
        sensors: param.data,
        pdfTimeInterval: 0,
        startTime: param.startTime,
        endTime: param.endTime,
        checkCompleteness: false,
        unit: unit,
      },
      product: {
        alertStrategy: 1,
        hardwareVersion: 'DW_V02',
        pdfChartType: 1,
        pdfLanguage: param.pdfTongue,
        pdfLogoColor: '',
        pdfLogoText: '',
        pdfMktShow: 1,
        pdfNameType: 2,
        pdfTemplateId: 0,
        pdfWebsite: 'http://172.16.22.82',
        referenceModel: '',
        alerts: [
          { type: 'temp', labelIndex: 0 },
          { type: 'humi', labelIndex: 0 },
        ],
      },
      order: {
        bounded: bounded,
        unbounded: bounded,
        unbindType: 3,
      },
      device: {
        terNo: record.deviceType,
        usage: 1,
        firmwareVersion: 'V01',
        model: record.getsn,
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
          startDelayTime: record.tempPeriod,
          timeZone: 'Asia/Shanghai',
          to: record.getsn,
          tripId: record.deviceType,
          vehicle: '',
          alerts: [
            {
              type: 'humi',
              unit: 'RH',
              min: record.lowHumi,
              receiveAlert: true,
              max: record.highHumi,
            },
            {
              type: 'temp',
              unit: param.tempUnit,
              min: record.lowtEmp,
              receiveAlert: true,
              max: record.hightEmp,
            },
          ],
          read: 5,
          report: 10,
        },
      },
      customer: { name: 'frigga', filePath: data.filePath },
    },
    monitors: monitors,
  };
};

export const setPdfData = async data => {
  const csvData = await data.csvData.filter(
    item => item.timeStamp >= data.param.startTime && item.timeStamp <= data.param.endTime
  );
  const monitors = await setMonitorData(csvData, data.param);
  const record = pdfData(data, monitors);
  return record;
};

const setMonitorData = (data, param) => {
  const tempData: any = [];
  const tempDataF: any = [];
  const humiData: any = [];
  const record = {};
  for (let index = 0; index < data.length; index++) {
    const item = data[index];
    const time = dayjs(item.timeStamp).valueOf();
    tempData.push({ timestamp: time, val: item.c, lbstime: time });
    humiData.push({ timestamp: time, val: item.humi, lbstime: time });
    tempDataF.push({ timestamp: time, val: item.humi, lbstime: time });
  }
  if (param.data.includes('temp')) {
    record['temp'] = tempData;
    // record['temp'] = param.tempUnit == '℃' ? tempData : tempDataF;
  }
  if (param.data.includes('humi')) {
    record['humi'] = humiData;
  }
  return record;
};

// c : 25.2  f: 77.3  humi:  64 timeStamp :  "2023-11-09 20:07:19"
