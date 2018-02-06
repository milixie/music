'use strict';
import utils from '../../utils/utils';
const Request = require('../../utils/request');
const config = require('./../../config');
const wechat = require('../../utils/wechat');
const data = require('../../utils/data');

const regeneratorRuntime = require('../../utils/regenerate');
const Promise = require('../../utils/promise');

Page({
  data: {
    animateData: {},
    playerData: {}
  },
  async onLoad() {
    const that = this;

    this.setData({
      playerData: data.songs[0]
    });

    // 音频背景图旋转动画
    let i = 1;
    this.animation = wechat.createAnimation({
      origin: '50% 50%',
      duration: 3000,
      delay: 0,
      timingFunction: 'linear'
    });
    that.animation.rotate(360 * i).step();
    this.setData({
      animateData: that.animation.export()
    });
    setInterval(() => {
      i++;
      that.animation.rotate(360 * i).step({duration: 3000});
      that.setData({
        animateData: that.animation.export()
      });
    }, 3000);
  }
});