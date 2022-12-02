import axios, { AxiosRequestConfig, AxiosInstance, AxiosResponse } from 'axios';
import { ElMessage, ElLoading } from 'element-plus';
import cookies from '@/utils/cookies';

import { TOKEN, NormalCode, ReLoginCode } from '@/config/constant';

type optionsType = {
  url: string;
  method?: string;
  data?: any;
  params?: Recordable;
  loading?: boolean;
};
type RequestConfig = AxiosRequestConfig;
export interface CancelRequestSource {
  [index: string]: () => void;
}
// interface ResultType<T = any> {
//   data?: T;
//   code?: number;
//   msg?: string;
// }

class HttpRequest {
  private baseUrl: string;
  private withCredentials = false;
  private timeout = 60 * 60 * 24 * 1000;
  private message = '';
  private instance: AxiosInstance = axios.create();
  private baseConfig: Recordable = {};
  private cancelRequestSourceMap: Map<string, () => void> = new Map();
  private requestCount = 0;
  private loading: any = null;
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.baseConfig = {
      baseURL: this.baseUrl,
      timeout: this.timeout,
      withCredentials: this.withCredentials,
      loading: true,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      }
    };
    this.setInterceptors(this.instance);
  }

  checkStatus(status: number) {
    let errMessage = '';
    switch (status) {
      case 400:
        errMessage = '错误请求';
        break;
      case 401:
        errMessage = '未授权，请重新登录';
        break;
      case 403:
        errMessage = '拒绝访问';
        break;
      case 404:
        errMessage = '请求错误,未找到该资源';
        break;
      case 405:
        errMessage = '请求方法未允许';
        break;
      case 408:
        errMessage = '请求超时';
        break;
      case 500:
        errMessage = '服务器端出错';
        break;
      case 501:
        errMessage = '网络未实现';
        break;
      case 502:
        errMessage = '网络错误';
        break;
      case 503:
        errMessage = '服务不可用';
        break;
      case 504:
        errMessage = '网络超时';
        break;
      case 505:
        errMessage = 'http版本不支持该请求';
        break;
      default:
        errMessage = '连接错误';
    }
    return errMessage;
  }

  getCancelRequestKey(config: RequestConfig) {
    const { url, method, params, data } = config;
    return [url, method, JSON.stringify(params), JSON.stringify(data)].join('&');
  }

  cancelAllRequest() {
    this.cancelRequestSourceMap.forEach(cancel => {
      cancel();
    });
    this.cancelRequestSourceMap.clear();
  }

  addCancelRequestSource(key: string, cancel: () => void) {
    this.cancelRequestSourceMap.set(key, cancel);
  }

  openLoading() {
    this.requestCount++;
    if (this.loading) return;
    this.loading = ElLoading.service({
      lock: true,
      text: 'loading...',
      // spinner: 'el-icon-loading',
      background: 'rgba(0,0,0,0.7)'
    });
  }

  closeLoading() {
    this.requestCount--;
    if (this.loading && !this.requestCount) {
      this.loading.close();
      this.loading = null;
    }
  }

  removeCancelRequestSource(key: string | string[]) {
    if (Array.isArray(key)) {
      key.forEach(item => {
        this.cancelRequestSourceMap.delete(item);
      });
    } else {
      this.cancelRequestSourceMap.delete(key);
    }
  }

  checkNormalStatus(code: string) {
    return NormalCode.some(item => code.endsWith(item));
  }

  ckeckReLoginStatus(code: string) {
    return ReLoginCode.some(item => code.endsWith(item));
  }

  // 拦截处理
  setInterceptors(instance: AxiosInstance) {
    // 请求拦截
    instance.interceptors.request.use(
      (config: RequestConfig) => {
        if (!navigator.onLine) {
          ElMessage({
            message: '请检查您的网络是否正常',
            type: 'error',
            duration: 3 * 1000
          });
          return Promise.reject(new Error('请检查您的网络是否正常'));
        }
        const token = cookies.get(TOKEN);
        if (token) {
          config.headers!.Authorization = token;
        }

        return config;
      },
      error => {
        return Promise.reject(new Error(error));
      }
    );

    // 响应拦截
    instance.interceptors.response.use(
      (response: AxiosResponse) => {
        const data = response.data;
        const code = data.code + '';
        // if the custom code is not 20000, it is judged as an error.
        if (!this.checkNormalStatus(code)) {
          const curmsg = data.msg ?? 'Unknown Error';
          // 相同的提示没有必要显示多次
          if (curmsg !== this.message) {
            this.message = curmsg;
            ElMessage({
              message: this.message,
              type: 'error',
              duration: 3000
            });
            setTimeout(() => {
              this.message = '';
            }, 1000);
          }
          if (this.ckeckReLoginStatus(code)) {
            useAuthStore().logout();
          }

          return Promise.reject(data.msg || 'Error');
        } else {
          return data.data;
        }
      },
      error => {
        if (error && error.response) {
          error.message = this.checkStatus(error.response.status);
        }
        const isTimeout = error.message.includes('timeout');
        ElMessage({
          message: isTimeout ? '网络请求超时' : error.message || '连接到服务器失败',
          type: 'error',
          duration: 2 * 1000
        });
        return Promise.reject(new Error(error.message));
      }
    );
  }

  request<T = any>(options: optionsType): Promise<T> {
    const params = Object.assign({}, this.baseConfig, options);
    return new Promise<T>((resolve, reject) => {
      const key = this.getCancelRequestKey(params);
      const controller = new AbortController();
      params.signal = controller.signal;
      this.addCancelRequestSource(key, controller.abort);
      params.loading && this.openLoading();
      this.instance
        .request<any, T>(params)
        .then(resolve)
        .catch(reject)
        .finally(() => {
          params.loading && this.closeLoading();
          this.removeCancelRequestSource(key);
        });
    });
  }
}

const http = new HttpRequest(import.meta.env.VITE_APP_BASE_URL);
export default http.request.bind(http);
const ucHttp = new HttpRequest(import.meta.env.VITE_APP_UC_URL);
export const ucRequest = ucHttp.request.bind(ucHttp);
