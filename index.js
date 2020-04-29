
let fs = require('fs');
let axios = require('axios');
let path = require('path');
let PDFParser = require('pdf2json');
let pdfParser = new PDFParser(this, 1);
 
const getUrls = () => {

  let promise = new Promise((resolve, reject) => {

    pdfParser.on('pdfParser_dataError', errData => reject(errData));
    pdfParser.on('pdfParser_dataReady', pdfData => {
      let urls = pdfParser.getRawTextContent().match(/http?:\/\/\S+/gi);
      resolve(urls);
    });
    pdfParser.loadPDF('./links.pdf');
  });

  return promise;
}

async function download() {

  let urls = await getUrls();

  urls.forEach( async url => {
    let name = url.substring(url.lastIndexOf("=")+1, url.length);
    url = 'https://link.springer.com/content/pdf/10.1007%2F'+name;
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream'
    });

    response.data.pipe(fs.createWriteStream(path.resolve(__dirname, 'pdfs', name+'.pdf')));
  });
}

download();