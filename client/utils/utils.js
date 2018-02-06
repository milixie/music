const formatDate = (date, format) => {
  if (format === undefined) {
    format = date;
    date = new Date();
  }
  const map = {
    M: date.getMonth() + 1, //月份
    d: date.getDate(), //日
    h: date.getHours(), //小时
    m: date.getMinutes(), //分
    s: date.getSeconds(), //秒
    q: Math.floor((date.getMonth() + 3) / 3), //季度
    S: date.getMilliseconds() //毫秒
  };
  const result = format.replace(/([yMdhmsqS])+/g, (all, t) => {
    let v = map[t];
    if (v !== undefined) {
      if (all.length > 1) {
        v = `0${v}`;
        v = v.substr(v.length - 2);
      }
      return v;
    } else if (t === 'y') {
      return (`${date.getFullYear()}`).substr(4 - all.length);
    }
    return all;
  });
  return result;
};

const formatNumber = num => {
  if (num >= 0 && num < 10) {
    return `0${num}`;
  }
  return num;
};

const formatTime = (time, showHour) => {
  const h = time.getUTCHours();
  const m = time.getUTCMinutes();
  const s = time.getUTCSeconds();
  if (showHour || h > 0) {
    return [h, m, s].map(formatNumber).join(':');
  } else {
    return [m, s].map(formatNumber).join(':');
  }
};

const rpxIntoPx = unit => {
  const res = wx.getSystemInfoSync();
  return unit * res.windowWidth / 750
};

const pxIntoRpx = unit => {
  const res = wx.getSystemInfoSync();
  return unit * 750 / res.windowWidth
};

module.exports = {
  formatDate,
  formatTime,
  rpxIntoPx,
  pxIntoRpx
};