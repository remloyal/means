import { dialog } from 'electron';
import { setPdfData } from './handleDevice';
import { createPdf } from '../../pdfgen/pdf';

export const exportDevicePdf = params => {
  return new Promise(async (resolve, reject) => {
    const dataPath = await selectSavePath();
    params.filePath = dataPath;
    const pdfData = await setPdfData(params);
    const data = createPdf(pdfData.info, pdfData.monitors);
    // console.log(dataPath);
    resolve(data);
  });
};

// 选择保存路径
export const selectSavePath = () => {
  return new Promise((resolve, reject) => {
    dialog
      .showOpenDialog({
        properties: ['openDirectory', 'createDirectory'],
      })
      .then(result => {
        console.log(result);
        if (result.canceled == false) {
          resolve(result.filePaths[0]);
        } else {
          reject(false);
        }
      })
      .catch(err => {
        console.log(err);
      });
  });
};
