const regeneratorRuntime = require('./utils/regenerate');
const Promise = require('./utils/promise');
App({
  /**
   * Global shared
   * 可以定义任何成员，用于在整个应用中共享
   */
  data: {
    name: 'music',
    version: '0.0.1',
  },

  globalData: {
    backgroundPlayer: null
  },
  async onLaunch() {
    this.globalData.backgroundPlayer = wx.getBackgroundAudioManager();
    try {
    } catch (e) {

    }
  },
/**
 * 生命周期函数--监听小程序显示
 * 当小程序启动，或从后台进入前台显示，会触发 onShow
 */
async onShow() {
},
/**
 * 生命周期函数--监听小程序隐藏
 * 当小程序从前台进入后台，会触发 onHide
 */
onHide() {
}
});
