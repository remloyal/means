import { net } from 'electron';
import http from 'http';
import https from 'https';
import { EventEmitter } from 'events';

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

// 检测网络连接状态
export function isOnline(url = 'https://www.friggatech.com/'): Promise<boolean> {
  return new Promise(resolve => {
    const request = net.request(url);

    request.on('response', () => {
      resolve(true);
      request.abort();
    });

    request.on('error', () => {
      resolve(false);
      request.abort();
    });

    request.end();
  });
}

export class IsOnlineService extends EventEmitter {
  isInternetAvailable: boolean;
  /**
   * @param {Object} [options]
   * @param {String} [options.authority] - a string that starts with http:// or https://
   * @param {Number} [options.rate] - number in milliseconds
   * @param {Object} [options.options]
   */
  constructor(
    options = {
      authority: 'https://www.friggatech.com/',
      rate: 10 * 1000,
    }
  ) {
    super();
    if (!options.rate) options.rate = 10 * 1000;
    this.isInternetAvailable = false;
    const checkForever = async () => {
      this.emit('checking');
      const result = await isOnline(options.authority);
      if (result !== this.isInternetAvailable) {
        this.isInternetAvailable = result;
        this.emit('status', result);
      }
      setTimeout(checkForever, options.rate);
    };
    setImmediate(checkForever);
  }
}
