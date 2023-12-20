import log from '../../unitls/log';
import PDFParser from 'pdf2json';
export const parsePDF = async (file, size, password = '') => {
  let passwordReading = password != '' || password != null ? true : false;
  return new Promise(async (resolve, reject) => {
    try {
      log.info('pdf2json', '开始读取');
      const textList: any = [];
      let index = 1;
      parseFileItems({ password }, file, async (err, item) => {
        if (err) {
          if (passwordReading) {
            log.error('parsePDF 密码读取失败，尝试无密码读取', err);
            passwordReading = false;
            const data = await parsePDF(file, size, '');
            resolve(data);
          } else {
            log.error('parsePDF', err);
            resolve(false);
          }
          log.error('parsePDF', err);
        } else if (!item) {
          log.info('pdf2json', '读取成功');
          resolve(textList);
        } else if (item.text) {
          const page = `${index}/${size}`;
          if (item.text.indexOf(page) != -1) {
            index++;
          } else {
            textList[index - 1] += item.text;
          }
        }
      });
    } catch (error) {
      log.error('parsePDF', error);
      resolve(false);
    }
  });
};

function getList(list) {
  //   const page = (index) => `${index}/${list.length}`;
  const textList: any = [];
  for (let index = 0; index < list.length; index++) {
    const element = list[index];
    const { Texts } = element;
    for (let i = 0; i < Texts.length; i++) {
      const text = Texts[i].R[0].T;
      textList[index] += decodeURIComponent(text);
    }
  }
  return textList;
}

function forEachItem(pdf, handler) {
  let pageNumber = 0;
  // pdf.formImage was removed in pdf2json@2, but we keep backward compatibility too
  const Pages = pdf.Pages || pdf.formImage.Pages;
  for (const p in Pages) {
    const page = Pages[p];
    const number = ++pageNumber;
    handler(null, {
      page: number,
      width: page.Width || (pdf.formImage ? pdf.formImage.Width : 0),
      height: page.Height || (pdf.formImage ? pdf.formImage.Pages[number - 1].Height : 0),
    });
    for (const t in page.Texts) {
      const item = page.Texts[t];
      item.text = decodeURIComponent(item.R[0].T);
      handler(null, item);
    }
  }
  handler();
}

// 路径读取
const parseFileItems = function (options, pdfFilePath, itemHandler) {
  itemHandler(null, { file: { path: pdfFilePath } });
  let pdfParser;
  if (options.password) {
    pdfParser = new PDFParser(null, null as any, options.password);
  } else {
    pdfParser = new PDFParser();
  }

  pdfParser.on('pdfParser_dataError', itemHandler);
  pdfParser.on('pdfParser_dataReady', pdfData => {
    forEachItem(pdfData, itemHandler);
  });
  const verbosity = options.debug ? 1 : 0;
  pdfParser.loadPDF(pdfFilePath, verbosity);
};

// Buffer 读取
const parseBuffer = function (options, pdfBuffer, itemHandler) {
  itemHandler(null, { file: { buffer: pdfBuffer } });
  let pdfParser;
  if (options.password) {
    pdfParser = new PDFParser(null, null as any, options.password);
  } else {
    pdfParser = new PDFParser();
  }

  pdfParser.on('pdfParser_dataError', itemHandler);
  pdfParser.on('pdfParser_dataReady', pdfData => {
    forEachItem(pdfData, itemHandler);
  });
  const verbosity = options.debug ? 1 : 0;
  pdfParser.parseBuffer(pdfBuffer, verbosity);
};
