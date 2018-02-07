'use strict';
import utils from '../../utils/utils';
const Request = require('../../utils/request');
const config = require('./../../config');
const wechat = require('../../utils/wechat');
const data = require('../../utils/data');
const toast = require('../../common/toast/toast');

const regeneratorRuntime = require('../../utils/regenerate');
const Promise = require('../../utils/promise');
const app = getApp();

Page({
  data: {
    animateData: {},
    playerData: {},
    currentTime: '00:00',
    duration: '00:00',
    progressWidth: 0,
    playing: false,
    waiting: true,
    i: 0,
    toast: {
      show: false,
      content: ''
    }
  },
  async onLoad() {
    const that = this;
    this.backgroundPlayer = app.globalData.backgroundPlayer;
    this.setData({
      playerData: data.songs[this.data.i]
    });
    // 给背景音频赋值
    this.backgroundPlayer.src = this.data.playerData.src;
    this.backgroundPlayer.title = this.data.playerData.name;
    this.duration = this.backgroundPlayer.duration || 0;

    // 音频开始播放
    this.backgroundPlayer.onPlay(() => {
      that.setData({
        playing: true
      })
    });

    // 音频播放进度控制
    this.backgroundPlayer.onTimeUpdate(() => {
      that.duration = that.backgroundPlayer.duration * 1000;
      that.currentTime = that.backgroundPlayer.currentTime * 1000;

      const {duration, currentTime, progressWidth} = this.setProgress(that.duration, that.currentTime);
      that.setData({
        duration,
        currentTime,
        progressWidth,
        waiting: false
      });
    });

    // 音频暂停后
    this.backgroundPlayer.onPause(() => {
      that.setData({
        playing: false
      })
    });

    this.backgroundPlayer.onWaiting(() => {
      this.setData({
        waiting: true
      });
    });

    this.backgroundPlayer.onError((res) => {
      let msg = '';
      switch (res.errCode) {
        case 10001:
          msg = '系统错误';
          break;
        case 10002:
          msg = '网络错误';
          break;
        case 10003:
          msg = '文件错误';
          break;
        case 10004:
          msg = '格式错误';
          break;
        default:
          msg = '未知错误';
          break;
      }
      toast.toast({
        show: true,
        content: msg
      });
      that.setData({waiting: true});
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
    this.timer = setInterval(() => {
      i++;
      that.animation.rotate(360 * i).step({duration: 3000});
      that.setData({
        animateData: that.animation.export()
      });
    }, 2500);
  },
  /**
   * 设置进度函数
   * @param duration
   * @param currentTime
   * @returns {{duration: *, currentTime: *, progressWidth: string}}
   */
  setProgress(duration, currentTime) {
    return {
      duration: utils.formatTime(new Date(duration)),
      currentTime: utils.formatTime(new Date(currentTime)),
      progressWidth: parseFloat(currentTime / duration * 100).toFixed(2)
    };
  },
  /**
   * 拖拽开始，记录当前拖拽的pageX
   * @param e
   */
  touchStartProgress(e) {
    this.touchStart = e.changedTouches[0].pageX;
    this.progress = parseInt(this.data.progressWidth * 250 / 100);
  },
  /**
   * 拖拽中，记录当前的pageX，并且与开始拖拽的点以及播放的当前进度条长度进行计算，得出拖拽的长度，重设播放进度条
   * @param e
   */
  touchMoveProgress(e) {
    let spacing = this.progress + e.changedTouches[0].pageX - this.touchStart;
    if (spacing >= 250) {
      spacing = 250;
    } else if (spacing <= 0) {
      spacing = 0;
    }
    const progressWidth = parseFloat(spacing / 250 * 100).toFixed(2);
    this.setData({
      progressWidth
    });
  },
  /**
   * 拖拽结束后，记录当前的pageX，并且与开始拖拽的点以及播放的当前进度条长度进行计算，得出拖拽的长度，重设播放进度条
   * @param e
   */
  touchEndProgress(e) {
    let spacing = this.progress + e.changedTouches[0].pageX - this.touchStart;
    if (spacing >= 250) {
      spacing = 250;
    } else if (spacing <= 0) {
      spacing = 0;
    }
    const progressWidth = parseFloat(spacing / 250 * 100).toFixed(2);
    this.setData({
      progressWidth
    });
    this.currentTime = progressWidth * this.duration / 100 || 0;
    this.backgroundPlayer.seek(this.currentTime / 1000);
  },
  /**
   * 改变播放状态
   */
  changePlayerStatus() {
    this.setData({
      playing: !this.data.playing
    });
    if (this.data.playing) {
      this.backgroundPlayer.play();
    } else {
      this.backgroundPlayer.pause();
    }
  },

  prev() {
    if (this.data.i === 0) {
      toast.toast({
        show: true,
        content: '已经是第一首'
      });
      return;
    }
    const currentIndex = this.data.i - 1;
    if (data.songs && data.songs[currentIndex]) {
      this.backgroundPlayer.src = data.songs[currentIndex].src;
      this.backgroundPlayer.title = data.songs[currentIndex].name;
      this.setData({
        playerData: data.songs[currentIndex],
        i: currentIndex
      });
    }

  },

  next() {
    if (this.data.i === Number(data.songs && data.songs.length - 1)) {
      toast.toast({
        show: true,
        content: '已经是最后一首'
      });
      return;
    }
    const currentIndex = this.data.i + 1;
    if (data.songs && data.songs[currentIndex]) {
      this.backgroundPlayer.src = data.songs[currentIndex].src;
      this.backgroundPlayer.title = data.songs[currentIndex].name;
      this.setData({
        playerData: data.songs[currentIndex],
        i: currentIndex
      });
      console.log(data.songs[currentIndex]);
    }
  }
});