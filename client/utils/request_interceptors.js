/**
 * Created by jiangq on 2017/1/2.
 * Description:
 */

'use strict';

const wechat = require('./wechat');
const config = require('../config');

module.exports = [{
  request({type, url, data, header}) {
    const session_id = wechat.getStorageSync('SESSION_ID');
    const header_with_session_id = {'X-Session-Id': session_id, 'X-Data-Gzid': config.gzid || 4, ...header};
    return {type, url, data, header: header_with_session_id};
  },
  response({data, header}) {
    const {session_id} = data || {};
    if (session_id) {
      wechat.setStorage('SESSION_ID', session_id);
    }
    return {data, header};
  }
}];
