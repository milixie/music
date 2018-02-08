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
    playerList: data.songs,
    currentTime: '00:00',
    duration: '00:00',
    progressWidth: 0,
    playing: false,
    waiting: true,
    drag: false,
    i: 0,
    toast: {
      show: false,
      content: ''
    },
    showList: false
  },
  async onLoad() {
    const that = this;
    this.backgroundPlayer = app.globalData.backgroundPlayer;
    this.setData({
      playerData: data.songs[this.data.i]
    });

    // 如果当前有音频
    if (!this.backgroundPlayer.src || this.backgroundPlayer.src !== this.data.playerData.src) {
      // 给背景音频赋值
      this.backgroundPlayer.src = this.data.playerData.src;
      this.backgroundPlayer.title = this.data.playerData.name;
      this.backgroundPlayer.coverImgUrl = this.data.playerData.image;
    }
    this.duration = this.backgroundPlayer.duration || 0;

    // 音频开始播放
    this.backgroundPlayer.onPlay(() => {
      that.setData({
        playing: true
      });
      this.duration = this.backgroundPlayer.duration || 0;
    });

    // 音频播放进度控制
    this.backgroundPlayer.onTimeUpdate(() => {
      that.duration = that.backgroundPlayer.duration * 1000;
      that.currentTime = that.backgroundPlayer.currentTime * 1000;

      const {duration, currentTime, progressWidth} = this.setProgress(that.duration, that.currentTime);
      if (that.data.drag) {
        that.setData({
          currentTime,
          waiting: false
        });
        return;
      }
      that.setData({
        duration,
        currentTime,
        progressWidth,
        waiting: false,
        playing: true
      });
    });

    // 音频暂停后
    this.backgroundPlayer.onPause(() => {
      that.setData({
        playing: false
      })
    });

    // 自然播放后，自动切换到下一首
    this.backgroundPlayer.onEnded(() => {
      if (that.data.i < Number(data.songs && data.songs.length - 1)) {
        that.setData({
          playerData: data.songs[that.data.i + 1],
          i: that.data.i + 1
        });
        that.backgroundPlayer.src = that.data.playerData.src;
        that.backgroundPlayer.title = that.data.playerData.name;
        that.backgroundPlayer.coverImgUrl = that.data.playerData.image;
      } else {
        const { duration } = this.setProgress(that.duration, 0);
        that.setData({
          duration
        });
      }
    });

    this.backgroundPlayer.onPrev(() => {
      that.prev();
    });

    this.backgroundPlayer.onNext(() => {
      that.next();
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
    this.setData({ drag: true });
    this.touchStart = e.changedTouches[0].pageX;
    this.progress = parseInt(this.data.progressWidth * utils.rpxIntoPx(500) / 100);
  },
  /**
   * 拖拽中，记录当前的pageX，并且与开始拖拽的点以及播放的当前进度条长度进行计算，得出拖拽的长度，重设播放进度条
   * @param e
   */
  touchMoveProgress(e) {
    let spacing = this.progress + e.changedTouches[0].pageX - this.touchStart;
    if (spacing >= utils.rpxIntoPx(500)) {
      spacing = utils.rpxIntoPx(500);
    } else if (spacing <= 0) {
      spacing = 0;
    }
    const progressWidth = parseFloat(spacing / utils.rpxIntoPx(500) * 100).toFixed(2);
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
    if (spacing >= utils.rpxIntoPx(500)) {
      spacing = utils.rpxIntoPx(500);
    } else if (spacing <= 0) {
      spacing = 0;
    }
    const progressWidth = parseFloat(spacing / utils.rpxIntoPx(500) * 100).toFixed(2);
    this.setData({
      progressWidth,
      drag: false
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
      this.backgroundPlayer.coverImgUrl = data.songs[currentIndex].image;
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
      this.backgroundPlayer.coverImgUrl = data.songs[currentIndex].image;
      this.setData({
        playerData: data.songs[currentIndex],
        i: currentIndex
      });
    }
  },

  async download() {
    try {
      const result = await wechat.downloadFile({
        url: data.songs[this.data.i].src
      });
      if (result && result.statusCode === 200) {

      }
    } catch (err) {
      console.log(err)
    }

  },

  showPlayerList() {
    this.setData({
      showList: true
    });
  },

  hidePlayerList() {
    this.setData({
      showList: false
    });
  },

  switchPlayer(e) {
    const id = e.currentTarget.dataset.id;
    if (id === this.data.playerData.id) {
      this.setData({
        showList: false
      });
      return;
    }
    const find = data.songs.find(item => item.id === id);
    if (find) {
      this.backgroundPlayer.src = find.src;
      this.backgroundPlayer.title = find.name;
      this.backgroundPlayer.coverImgUrl = find.image;
      this.setData({
        showList: false,
        playerData: find
      });
    }
  }
});