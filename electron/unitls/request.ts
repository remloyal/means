import { net } from 'electron';
import http from 'http';
import https from 'https';
import { EventEmitter } from 'events';
import { PING_TIMEOUT, PING_URL_LIST } from '../config';

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
      method,
      headers,
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
      method,
      headers,
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
export function isOnline(url = PING_URL_LIST[0]): Promise<boolean> {
  return new Promise(resolve => {
    const request = net.request(url);
    request.on('response', () => {
      resolve(true);
      request.abort();
    });

    request.on('error', () => {
      request.abort();
      resolve(false);
    });
    setTimeout(() => {
      request.abort();
      resolve(false);
    }, PING_TIMEOUT);
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
      authority: PING_URL_LIST[0],
      rate: PING_TIMEOUT,
    }
  ) {
    super();
    if (!options.rate) options.rate = PING_TIMEOUT;
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

export const isNetworkState = async () => {
  let state = false;
  for (let i = 0; i < PING_URL_LIST.length; i++) {
    const url = PING_URL_LIST[i];
    state = await isOnline(url);
    if (state) {
      break;
    }
  }
  return state;
};
