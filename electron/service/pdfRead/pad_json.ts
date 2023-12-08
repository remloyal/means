export const parsePDF = async (file, size) => {
  return new Promise(async (resolve, reject) => {
    // const pdfParser = new PDFParser();
    // pdfParser.on('pdfParser_dataError', errData => {
    //   resolve(false);
    // });
    // pdfParser.on('pdfParser_dataReady', async pdfData => {
    //   const list = pdfData.Pages;
    //   const data = await getList(list);
    //   resolve(data);
    // });

    // pdfParser.loadPDF(file);
    const { PdfReader } = await import('pdfreader');
    const textList: any = [];
    let index = 1;
    new PdfReader(null).parseFileItems(file, (err, item) => {
      if (err) console.error('error:', err);
      else if (!item) {
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
