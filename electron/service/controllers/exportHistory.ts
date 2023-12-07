import { filePath } from '../../unitls/unitls';
import { queryHistoryDeviceList } from './device';
import { selectSavePath } from './exportDevice';
import Excel, { BorderStyle, Borders } from 'exceljs';
import log from '../../pdfgen/log';
import dayjs from 'dayjs';
import { timeDiff } from '../../unitls/tool';
import { text } from '../../pdfgen/gloable/language';

export const exportHistory = async params => {
  const deviceList = await queryHistoryDeviceList(params.key);
  const excelPath = await selectSavePath();

  if (!excelPath) return false;

  params.excelPath = excelPath;
  if (!params.lang) {
    params.lang = 'zh';
  }
  try {
    createExcel(params, deviceList);
  } catch (error) {
    log.error(error);
  }
  return deviceList;
};

const createExcel = async (params, deviceList) => {
  const workbook = new Excel.Workbook();
  workbook.created = new Date();
  workbook.modified = new Date();

  imgSheet(workbook, { params });
  log.info('====【1】==== 创建图片表');

  infoSheet(workbook, { params, data: deviceList });
  log.info('====【2】==== 创建设备信息表');

  dataListSheet(workbook, { params, data: deviceList });
  log.info('====【3】==== 创建数据表');

  const newpath = params.excelPath + '/frigga_' + dayjs().format('YYYYMMDDHHmmss') + '.xlsx';
  workbook.xlsx.writeFile(newpath);
  log.info('====【4】==== 创建Excel,路径：', newpath);
};

// 第一页 图片
const imgSheet = (workbook: Excel.Workbook, { params }) => {
  const { lang } = params;
  const worksheet = workbook.addWorksheet(text('EXCEL_DEVICE_CHART', lang), {
    views: [{ showGridLines: false }],
  });
  const imageId1 = workbook.addImage({
    base64: params.img,
    extension: 'png',
  });
  worksheet.addImage(imageId1, 'B2:Y41');
};

// 第二页 设备信息
const infoSheet = (workbook: Excel.Workbook, { params, data }) => {
  const { lang } = params;
  const worksheet = workbook.addWorksheet(text('EXCEL_DEVICE_INFO', lang), {
    views: [{ showGridLines: false }],
  });
  const title = [text('EXCEL_DEVICE', lang)];
  const titleRow = worksheet.addRow(title);
  worksheet.mergeCells(1, 1, 1, 3);
  worksheet.mergeCells(1, 4, 1, 14);
  setRowStyle(worksheet, titleRow.cellCount, titleRow.number);
  worksheet.getCell(titleRow.number, 6).value = text('EXCEL_DEVICE_OVER', lang);
  const tab = [
    text('EXCEL_DEVICE_NAME', lang),
    text('EXCEL_DEVICE', lang),
    text('EXCEL_DEVICE_STATUS', lang),
    text('EXCEL_DEVICE_MAX', lang),
    text('EXCEL_DEVICE_MIN', lang),
    'MKT',
    text('EXCEL_DEVICE_VERSION', lang),
    text('EXCEL_DEVICE_INTERVAL', lang),
    text('EXCEL_DEVICE_START', lang),
    text('EXCEL_DEVICE_END', lang),
    text('EXCEL_DEVICE_POINTS', lang),
    text('EXCEL_DEVICE_DURATION', lang),
    text('EXCEL_DEVICE_NUMBER', lang),
    text('EXCEL_DEVICE_NOTES', lang),
  ];
  const tabRow = worksheet.addRow(tab);
  setRowStyle(worksheet, tabRow.cellCount, tabRow.number);
  const rowList: any[] = [];
  for (let index = 0; index < data.length; index++) {
    const item = data[index];
    const { record } = item.otherData;
    rowList.push([
      item.dataName,
      item.gentsn,
      '正常',
      item.temperature.max,
      item.temperature.min,
      item.temperature.average,
      '1.0.0',
      `${record.tempPeriod / 60} Min`,
      item.csvData[0].timeStamp,
      item.csvData[item.csvData.length - 1].timeStamp,
      item.csvData.length,
      timeDiff(item.csvData[0].timeStamp, item.csvData[item.csvData.length - 1].timeStamp),
      '',
      '',
    ]);
  }
  worksheet.addRows(rowList);
  const rowCount = worksheet.getRow(3);
  const height = rowList.length + 3;
  for (let i = 3; i <= height; i++) {
    for (let j = 1; j < rowCount.cellCount + 1; j++) {
      const dobCol = worksheet.getCell(i, j);
      dobCol.border = borderStyle;
      var columnLength = dobCol.value ? dobCol.value.toString().length : 10;
      dobCol.alignment = { vertical: 'middle', horizontal: 'center' };
      const column = worksheet.getColumn(j);
      column.width = columnLength * 1.3;
    }
  }
  worksheet.getColumn(1).width = 50;
  worksheet.getColumn(9).width = 30;
  worksheet.getColumn(10).width = 30;
};

// 第三页
const dataListSheet = (workbook: Excel.Workbook, { params, data }) => {
  const { lang } = params;
  const worksheet = workbook.addWorksheet(text('EXCEL_DEVICE_LIST', lang), {
    // properties: { tabColor: { argb: '#FFFFFF' } },
    views: [{ showGridLines: false }],
  });

  const rowList: any[] = [];
  const nameList: any[] = [[''], ['']];
  const tableList: any[] = ['#'];
  let arrange = 0;
  data.forEach((res, index) => {
    const { csvData } = res;
    for (let index = 0; index < csvData.length; index++) {
      const element = csvData[index];

      //   数据列
      if (rowList[index]) {
        const row = [...rowList[index], element.timeStamp, element.c];
        rowList[index] = row;
      } else {
        const i = arrange * 2;
        const data = [index + 1];
        data[i + 1] = element.timeStamp;
        data[i + 2] = element.c;
        rowList[index] = data;
      }
    }
    nameList[0].push(res.dataName, '');
    nameList[1].push(res.gentsn, '');
    tableList.push(text('EXCEL_DEVICE_TIME', lang), 'T(°C)');
    arrange++;
  });
  worksheet.addRows(nameList);
  const tableRow = worksheet.addRow(tableList);
  for (let i = 1; i <= tableRow.cellCount; i++) {
    const dobCol = worksheet.getCell(tableRow.number, i);
    dobCol.fill = fillStyle;
    dobCol.border = borderStyle;
    dobCol.alignment = { vertical: 'middle', horizontal: 'center' };
  }

  worksheet.addRows(rowList);

  const rowCount = worksheet.getRow(4);
  const height = rowList.length + 4;
  for (let i = 3; i <= height; i++) {
    for (let j = 1; j < rowCount.cellCount + 1; j++) {
      const dobCol = worksheet.getCell(i, j);
      dobCol.border = borderStyle;
      var columnLength = dobCol.value ? dobCol.value.toString().length : 10;
      dobCol.alignment = { vertical: 'middle', horizontal: 'center' };
      const column = worksheet.getColumn(j);
      column.width = columnLength * 1.3;
    }
  }

  worksheet.mergeCells('A1:A2');
  //   处理第一、二行样式
  [1, 2].forEach(item => {
    const row = worksheet.getRow(item);
    // 获取该行所有单元格的数据，并按两个两个进行处理
    for (let i = 2; i <= row.cellCount; i += 2) {
      worksheet.mergeCells(item, i, item, i + 1);
    }
    for (let i = 1; i <= row.cellCount; i++) {
      const dobCol = worksheet.getCell(item, i);
      dobCol.fill = fillStyle;
      dobCol.border = borderStyle;
    }
  });
  selfAdaption(worksheet);
};

const fillStyle = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: {
    argb: 'FFD3D3D3',
  },
} as Excel.Fill;

const borderStyle = {
  top: { style: 'thin', color: { argb: 'FFA9A9A9' } },
  left: { style: 'thin', color: { argb: 'FFA9A9A9' } },
  bottom: { style: 'thin', color: { argb: 'FFA9A9A9' } },
  right: { style: 'thin', color: { argb: 'FFA9A9A9' } },
} as Partial<Borders>;

const setRowStyle = (worksheet: Excel.Worksheet, cellCount, number) => {
  for (let i = 1; i <= cellCount; i++) {
    const dobCol = worksheet.getCell(number, i);
    dobCol.fill = fillStyle;
    dobCol.border = borderStyle;
    dobCol.alignment = { vertical: 'middle', horizontal: 'center' };
  }
};

// 单云格自适应
const selfAdaption = (worksheet: Excel.Worksheet) => {
  worksheet.columns.forEach(function (column, i) {
    if (i !== 0) {
      var maxLength = 0;
      column['eachCell']!({ includeEmpty: true }, function (cell) {
        var columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = maxLength < 10 ? 10 : maxLength + 6;
      column.alignment = { vertical: 'middle', horizontal: 'center' };
      column.border = borderStyle;
    }
  });
};
