import { dialog } from 'electron';
import { setPdfData } from './handleDevice';
import { createPdf } from '../../pdfgen/pdf';
import { win } from '../../main/index';
import dayjs from 'dayjs';

export const exportDevicePdf = params => {
  return new Promise(async (resolve, reject) => {
    try {
      const time = dayjs(new Date()).format('YYYYMMDDHHmmss');
      const csvName = `${params.record.deviceType}_${params.record.getsn}_${time}`;
      const dataPath = await selectSavePath(params.csvName ? `${params.csvName}_${time}` : csvName);
      params.filePath = dataPath;
      const pdfData = await setPdfData(params);
      const data = createPdf(pdfData.info, pdfData.monitors);
      // console.log(dataPath);
      resolve(data);
    } catch (error) {
      resolve(false);
    }
  });
};
const typeList = {
  pdf: { name: '', extensions: ['pdf'] },
  xlsx: { name: '', extensions: ['xlsx'] },
};

// 选择保存路径
export const selectSavePath = (name = '', type = ['pdf']) => {
  return new Promise((resolve, reject) => {
    dialog
      .showSaveDialog(win!, {
        defaultPath: `${name}`,
        // properties: ['openDirectory', 'createDirectory'],
        filters: type.map(key => typeList[key]),
      })
      .then(result => {
        console.log(result);
        if (result.canceled == false) {
          resolve(result.filePath);
        } else {
          reject(false);
        }
      })
      .catch(err => {
        console.log(err);
      });
  });
};
