const Promise = require('./promise');
const regeneratorRuntime = require('./regenerate');

function login() {
  return new Promise((resolve, reject) => {
    wx.login({success: resolve, fail: reject});
  });
}

function getUserInfo() {
  return new Promise((resolve, reject) => {
    wx.getUserInfo({success: resolve, fail: reject});
  });
}

function setStorage(key, data) {
  return new Promise((resolve, reject) => {
    wx.setStorage({key, data, success: resolve, fail: reject});
  });
}

function getStorage(key) {
  return new Promise((resolve, reject) => {
    wx.getStorage({key, success: ({data}) => resolve(data), fail: reject});
  });
}

function getLocation(type) {
  return new Promise((resolve, reject) => {
    wx.getLocation({type, success: resolve, fail: reject});
  });
}
function showToast(title, icon, duration = 1500, mask = false) {
  return new Promise((resolve, reject) => {
    wx.showToast({
      title,
      icon,
      duration,
      mask,
      success: resolve,
      fail: reject
    });
  });
}

function showModal(title, content, config = {}) {
  const {show_cancel, cancel_text, cancel_color, confirm_text, confirm_color} = config;

  return new Promise((resolve, reject) => {
    wx.showModal({
      showCancel: show_cancel,
      title,
      content,
      success: resolve,
      fail: reject
    });
  });
}
/**
 * 上传文件
 * @param url
 * @param filePath
 * @param name
 * @param header
 * @param formData
 * @return {*}
 */
function uploadFile(url, filePath, name, header, formData) {
  const session_id = wx.getStorageSync('SESSION_ID');
  const header_with_session_id = {'X-Session-Id': session_id, ...header};
  const header_with_header = {...header_with_session_id, ...header};
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url,
      filePath,
      name,
      header: header_with_header,
      formData,
      success: resolve,
      fail: reject
    });
  });
}
/**
 * 选择图片
 * @param count
 * @param sizeType
 * @param sourceType
 */
function chooseImage(count = 9, sizeType, sourceType) {
  let size_types = ['original', 'compressed'];
  let source_type = ['album', 'camera'];
  if (sizeType) {
    size_types = [sizeType];
  }
  if (sourceType) {
    source_type = [sourceType];
  }
  return new Promise((resolve, reject) => {
    wx.chooseImage({
      count,
      sizeType: size_types,
      sourceType: source_type,
      success: resolve,
      fail: reject
    });
  });
}
/**
 * 支付
 * @param timeStamp
 * @param nonceStr
 * @param prepay_id
 * @param paySign
 */
function requestPayment(timeStamp, nonceStr, prepay_id, paySign) {
  return new Promise((resolve, reject) => {
    console.log({
      timeStamp,
      nonceStr,
      paySign,
      signType: 'MD5',
      package: prepay_id
    });
    wx.requestPayment({
      timeStamp,
      nonceStr,
      paySign,
      signType: 'MD5',
      package: prepay_id,
      success: resolve,
      fail: reject
    });
  });
}

function navigateTo(url) {
  return new Promise((resolve, reject) => {
    wx.navigateTo({
      url,
      success: resolve,
      fail: reject
    });
  });
}

function redirectTo(url) {
  return new Promise((resolve, reject) => {
    wx.redirectTo({
      url,
      success: resolve,
      fail: reject
    });
  });
}

function makePhoneCall(tel) {
  return new Promise((resolve, reject) => {
    wx.makePhoneCall({
      phoneNumber: tel,
      success: resolve,
      fail: reject
    });
  });
}

function openLocation(latitude, longitude, {scale, name, address}) {
  return new Promise((resolve, reject) => {
    wx.openLocation({
      latitude,
      longitude,
      scale,
      name,
      address,
      fail: reject,
      success: resolve
    });
  });
}
function showLoading(title, mask) {
  return new Promise((resolve, reject) => {
    wx.showLoading({
      title,
      mask,
      fail: reject,
      success: resolve
    });
  });
}

function request(type, url, data) {
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method: type,
      data,
      success: resolve,
      fail: reject
    })
  })
}

function createAnimation({origin, duration, delay, timingFunction}) {
  return wx.createAnimation({
    duration,
    transformOrigin: origin,
    delay,
    timingFunction
  })
}

function downloadFile({url, header}) {
  return new Promise((resolve, reject) => {
    wx.downloadFile({
      url,
      header,
      success: resolve,
      fail: reject
    })
  });
}

module.exports = {
  ...wx,
  login,
  getUserInfo,
  setStorage,
  getStorage,
  getLocation,
  uploadFile,
  chooseImage,
  showToast,
  showModal,
  requestPayment,
  navigateTo,
  redirectTo,
  makePhoneCall,
  openLocation,
  showLoading,
  request,
  createAnimation,
  downloadFile
};
