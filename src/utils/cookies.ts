import Cookies from 'js-cookie';
const { hostname } = window.location;

interface ProxyCookie {
  getAll(): any;
  clearAll(): void;
  get(Key: string, hasPrefix: boolean): any;
  set(key: string, value: any, params: any): any;
  remove(key: string, hasPrefix: boolean): any;
}

class CookieProxy implements ProxyCookie {
  protected prefix = 'mgmt__';
  protected baseParams: any;

  constructor() {
    this.baseParams = {
      expires: 7,
      path: '/',
      domain: hostname || undefined
      // Secure : true,
      // SameSite : 'none',
    };
  }

  getAll(): any {
    return Cookies.get();
  }

  clearAll(): void {
    const keys = Object.keys(this.getAll());
    keys.forEach(key => {
      this.remove(key, false);
    });
  }

  get(key: string, hasPrefix = true) {
    const keyStr = hasPrefix ? this.prefix + '' + key : key;
    return Cookies.get(keyStr);
  }

  set(key: string, value: any, params?: any) {
    const options = params === undefined ? this.baseParams : params;
    const keyStr = this.prefix + '' + key;
    return Cookies.set(keyStr, value, options);
  }

  remove(key: string, hasPrefix = true) {
    const keyStr = !hasPrefix ? key : this.prefix + '' + key;
    return Cookies.remove(keyStr, {
      path: '/',
      domain: hostname
    });
  }
}
const cookies = new CookieProxy();

export default cookies;
