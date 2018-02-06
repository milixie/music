'use strict';

const Promise = require('./promise');
const wechat = require('./wechat');
const sleep = require('./sleep');
const regeneratorRuntime = require('./regenerate');

const type_enum = {
  GET: 'GET',
  POST: 'POST'
};
const symbol_request_interceptor = '@@request_interceptor';
const symbol_response_interceptor = '@@response_interceptor';
const symbol_resource = '@@symbol_resource';

class Resource {
  constructor(url, cross) {
    this.interceptors = [];
    this.url = url;
    this.cross = cross;
  }

  /**
   * get请求
   * @param data
   * @returns {Object} Promise
   */
  get(data, header) {
    return this[symbol_resource]({type: type_enum.GET, url: this.url, data: data || {}, header});
  }

  /**
   * post请求
   * @param data
   * @returns {Object} Promise
   */
  post(data, header) {
    return this[symbol_resource]({type: type_enum.POST, url: this.url, data: data || {}, header});
  }

  static async lock() {
    await wechat.setStorage('REQUEST_STATUS', 'BLOCK');
  }
  static async unlock() {
    await wechat.setStorage('REQUEST_STATUS', 'OK');
  }

  /**
   * 请求拦截器处理
   * @param type
   * @param url
   * @param data
   * @returns {{type: *, url: *, data: *}}
   */
  [symbol_request_interceptor]({type, url, data, header}) {
    let proxy_request = {type, url, data, header};
    this.interceptors.forEach(interceptor => (proxy_request = interceptor.request(proxy_request)));
    return proxy_request;
  }

  /**
   * 返回拦截器处理
   * @param status
   * @param data
   * @returns {{status: *, data: *}}
   */
  [symbol_response_interceptor]({data, header}) {
    let proxy_response = {data, header};
    this.interceptors.forEach(interceptor => (proxy_response = interceptor.response(proxy_response)));
    return proxy_response;
  }

  /**
   * ajax处理
   * @param type
   * @param url
   * @param data
   * @returns {Promise}
   */
  async [symbol_resource]({type, url, data, header}) {
    if (!this.cross) {
      while (true) {
        const status = await wechat.getStorage('REQUEST_STATUS');
        if (status === 'OK') break;
        await sleep(300);
      }
    }

    const request_data = this[symbol_request_interceptor]({type, url, data, header});
    return await new Promise((resolve, reject) => {
      wx.request({
        url: request_data.url,
        data: request_data.data,
        header: request_data.header,
        method: type,
        success: res => {
          const proxy_data = this[symbol_response_interceptor](res);
          if (proxy_data.status >= 500) {
            reject(proxy_data.data);
          } else {
            resolve(proxy_data.data);
          }
        },
        fail: res => {
          if (res.errMsg) {
            reject(res.errMsg);
          } else {
            const proxy_data = this[symbol_response_interceptor](res);
            reject(proxy_data.data);
          }
        }
      });
    });
  }
}
module.exports = Resource;
