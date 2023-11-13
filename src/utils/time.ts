export function splitStringTime(str: string) {
    let time = '';
    time += str.substring(0, 4);
    time += `-${str.substring(4, 6)}`;
    time += `-${str.substring(6, 8)}`;
    time += ` ${str.substring(8, 10)}`;
    time += `:${str.substring(10, 12)}`;
    time += `:${str.substring(12, 14)}`;
    return time;
  }
  