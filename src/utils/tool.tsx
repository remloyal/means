import { useCallback, useEffect, useRef } from 'react';
/**
 * 函数节流
 * @param fn 执行函数 需要防抖的函数也就是你处理逻辑的地方
 * @param time 时间间隔
 * @param params 执行函数需要的参数
 * @param dep useCallback的依赖项
 * @returns
 */
export function useThrottle(fn, delay, dep = []) {
  const defaultData: { fn: any; pre: number } = { fn, pre: 0 };
  const { current = { fn: null, pre: 0 } } = useRef(defaultData);
  useEffect(() => {
    current.fn = fn;
  }, [fn]);
  return useCallback((...args) => {
    // 用时间间隔做限制
    const now = new Date().getTime();
    const timeDiff = now - (current?.pre || 0);
    if (timeDiff > delay) {
      current.pre = now;
      current.fn?.(...args);
    }
  }, dep);
}
