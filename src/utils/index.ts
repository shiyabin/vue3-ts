import { validPhone } from './validate';
import moment from 'moment';
// 单词首字母转大写
export function toUpperCaseWord(val?: string): string {
  if (!val) return '';
  return val.toLowerCase().replace(/( |^)[a-z]/g, L => L.toUpperCase());
}

/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string | null}
 */
export function parseTime(time?: object | string | number | null, cFormat?: string): string | null {
  return moment(time).format(cFormat);
}

/**
 * @param {number} time
 * @param {string} option
 * @returns {string}
 */
export function formatTime(time: string | number, option?: string) {
  if (('' + time).length === 10) {
    time = parseInt(time) * 1000;
  } else {
    time = +time;
  }
  const d: any = new Date(time);
  const now: number = Date.now();

  const diff: number = (now - d) / 1000;

  if (diff < 30) {
    return '刚刚';
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + '分钟前';
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前';
  } else if (diff < 3600 * 24 * 2) {
    return '1天前';
  }
  if (option) {
    return parseTime(time, option);
  } else {
    return d.getMonth() + 1 + '月' + d.getDate() + '日' + d.getHours() + '时' + d.getMinutes() + '分';
  }
}

export function encryptionPhone(val: string | number) {
  const phone = val + '';
  if (!validPhone(phone)) {
    return '';
  }
  const reg = /^(\d{3})\d{4}(\d{4})$/;
  return phone.replace(reg, '$1****$2');
}

/**
 * @param {Function} func
 * @param {number} wait
 * @param {boolean} immediate
 * @return {*}
 */
export function debounce(func: () => any, wait: number, immediate = false) {
  let timeout: NodeJS.Timeout | null, args: [], context: any, timestamp: number, result: any;

  const later = function () {
    // 据上一次触发时间间隔
    const last = +new Date() - timestamp;

    // 上次被包装函数被调用时间间隔 last 小于设定时间间隔 wait
    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) {
          context = null;
          args = [];
        }
      }
    }
  };

  return function (this: any, ...args: []) {
    context = this;
    timestamp = +new Date();
    const callNow = immediate && !timeout;
    // 如果延时不存在，重新设定延时
    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, args);
      context = null;
      args = [];
    }

    return result;
  };
}

/**
 * This is just a simple version of deep copy
 * Has a lot of edge cases bug
 * If you want to use a perfect deep copy, use lodash's _.cloneDeep
 * @param {Object} source
 * @returns {Object}
 */
export function deepClone(source: Recordable) {
  if (!source && typeof source !== 'object') {
    throw new Error('error arguments');
  }
  const targetObj: any = source.constructor === Array ? [] : {};
  Object.keys(source).forEach((keys: string | number) => {
    if (source[keys] && typeof source[keys] === 'object') {
      targetObj[keys] = deepClone(source[keys]);
    } else {
      targetObj[keys] = source[keys];
    }
  });
  return targetObj;
}
