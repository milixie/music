'use strict';
import utils from '../../utils/utils';

const regeneratorRuntime = require('../../utils/regenerate');
const Promise = require('../../utils/promise');

Page({
  data: {
    currentTime: utils.formatTime(new Date(0), 'mm:ss'),
    duration: utils.formatTime(new Date(0), 'mm:ss'),
    playerWidth: 0,
    playing: false,
    drag: false,
    tempFilePath: 'http://ws.stream.qqmusic.qq.com/M500001VfvsJ21xFqb.mp3?guid=ffffffff82def4af4b12b3cd9337d5e7&uin=346897220&vkey=6292F51E1E384E061FF02C31F716658E5C81F5594D561F2E88B854E81CAAB7806D5E4F103E55D33C16F3FAC506D1AB172DE8600B37E43FAD&fromtag=46',
  },
  onShow() {
    if (this.innerAudioContext) return;
    this.innerAudioContext = wx.createInnerAudioContext();
    this.innerAudioContext.src = this.data.tempFilePath;
    this.innerAudioContext.autoplay = false;
    const that = this;
    this.innerAudioContext.onPlay(() => {
      console.log('开始播放')
    });
    this.innerAudioContext.onTimeUpdate(() => {
      const duration = that.innerAudioContext.duration;
      const currentTime = that.innerAudioContext.currentTime;
      that.setData({
        currentTime: utils.formatTime(new Date(currentTime * 1000), 'mm:ss'),
        duration: utils.formatTime(new Date(duration * 1000), 'mm:ss')
      });
      const progress = Number(currentTime / duration * utils.rpxIntoPx(500));
      if (that.data.drag) return;
      that.setData({
        playerWidth: progress,
        x: progress
      })
    });
    this.innerAudioContext.onSeeked(() => {
      const duration = that.innerAudioContext.duration;
      that.setData({
        duration: utils.formatTime(new Date(duration * 1000), 'mm:ss')
      });
    });
    this.innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    });
    this.innerAudioContext.onEnded(() => {
      console.log('播放结束啦');
      this.setData({
        playing: false
      })
    })
  },
  controlPlayStatus () {
    this.setData({
      playing: !this.data.playing
    });
    if (this.data.playing) {
      this.innerAudioContext.play();
    } else {
      this.innerAudioContext.pause();
    }
  },

  touchStartTime(e) {
    this.setData({
      drag: true
    });
    this.startX = e.changedTouches[0].pageX;
    this.currentPlayerWidth = this.data.playerWidth;
    this.duration = this.innerAudioContext.duration;
  },

  changePlayerTime(e) {
    this.currentX = e.changedTouches[0].pageX;
    let width = this.currentPlayerWidth + this.currentX - this.startX;
    if (width > utils.rpxIntoPx(500)) {
      width = utils.rpxIntoPx(500);
    }
    if (width < 0) {
      width = 0;
    }
    this.setData({
      playerWidth: width
    })
  },

  touchEndTime(e) {
    this.endX = e.changedTouches[0].pageX;
    let width = this.currentPlayerWidth + this.endX - this.startX;
    if (width > utils.rpxIntoPx(500)) {
      width = utils.rpxIntoPx(500);
    }
    if (width < 0) {
      width = 0;
    }
    const duration = this.innerAudioContext.duration || this.duration;
    console.log(utils.rpxIntoPx(500));
    const seek = width / utils.rpxIntoPx(500) * duration;
    this.innerAudioContext.seek(seek);
    this.setData({
      drag: false,
      playerWidth: width,
      currentTime: utils.formatTime(new Date(seek * 1000), 'mm:ss'),
    });
  }
});