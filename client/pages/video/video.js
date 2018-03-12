'use strict';
const regeneratorRuntime = require('../../utils/regenerate');
const Promise = require('../../utils/promise');
const wechat = require('../../utils/wechat');
const request = require('../../utils/request');

Page({
  data: {

  },
  async onLoad() {
    console.log('page is loading')
  },
  linkToPlayer() {
    wechat.navigateTo('/pages/player/player');
  },
  getWeather() {
    console.log('获取天气情况');
    wx.request({
      url: 'http://www.weather.com.cn/data/cityinfo/101010100.html',
      method: 'GET',
      success: (res) => {
        console.log(res);
      }
    });
  }
});

