import http from 'http';
import https from 'https';

export const request = async (url, method?, headers?, data?) => {
  let todo: any = null;
  if (url.indexOf('https') == 0) {
    todo = await httpsRequest(url, method, headers, data);
  } else {
    todo = await httpRequest(url, method, headers, data);
  }
  return todo;
};

function httpRequest(url, method?, headers?, data?) {
  return new Promise((resolve, reject) => {
    const options = {
      method: method,
      headers: headers,
    };
    const request = http.request(url, options, response => {
      let responseData = '';

      response.on('data', chunk => {
        responseData += chunk;
      });

      response.on('end', () => {
        resolve(responseData);
      });
    });

    request.on('error', error => {
      reject(error);
    });

    if (data) {
      request.write(data);
    }

    request.end();
  });
}

function httpsRequest(url, method?, headers?, data?) {
  return new Promise((resolve, reject) => {
    const options = {
      method: method,
      headers: headers,
    };
    const request = https.request(url, options, response => {
      let responseData = '';

      response.on('data', chunk => {
        responseData += chunk;
      });

      response.on('end', () => {
        resolve(responseData);
      });
    });

    request.on('error', error => {
      reject(error);
    });

    if (data) {
      request.write(data);
    }

    request.end();
  });
}
