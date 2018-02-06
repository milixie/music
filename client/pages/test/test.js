'use strict';
const regeneratorRuntime = require('../../utils/regenerate');
const Promise = require('../../utils/promise');
const wechat = require('../../utils/wechat');

Page({
  data: {

  },
  async onLoad() {
    console.log('page is loading')
  },
  linkToPlayer() {
    wechat.navigateTo('/pages/player/player');
  }
});

