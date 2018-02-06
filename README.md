# 小程序-音乐播放器

### 小程序知识点 ~ 播放器

首先要了解一下微信小程序中关于播放器的知识点：

1.`wx.getBackgroundAudioManager()`

2.它的属性列表如下

>- `duration` 音频时长
>- `currentTime` 当前播放进度时长
>- `paused` 当前音频是否是暂停状态
>- `src` 当前音频的url，这里需要注意一点就是当音频的`src`属性重新赋值的话，新的音频会自动播放
>- `startTime` 音频开始播放的位置
>- `buffered` 音频缓冲的时间点
>- `title` 音频标题
>- `epname` 专辑名
>- `singer` 歌手名
>- `coverImgUrl` 封面图url，这个是用于退出小程序后台继续播放音频的时候的封面图
>- `webUrl` 页面链接

3.它的对象方法列表

>- `play` 
>- `stop`
>- `pause`
>- `seek`
>- `onCanPlay`
>- `onPlay`
>- `onPause`
>- `onStop`
>- `onPrev`
>- `onNext`
>- `onError`
>- `onWaiting`

### 开发过程

1. 背景音频 `wx.getBackgroundAudioManager` 该放在哪里呢

开始的时候，我直接在 `player.js` 文件中的 `onLoad` 方法中写，发现当每次 `onLoad` 方式进入该页面的时候，都会重新设置一个新的背景音频，导致音频重复播放，（真机上面是这样的，但是开发者工具里面不会重新播放）那该放在哪里呢

放在全局就不会出现这种情况了

代码如下：

```$xslt
// 在app.js 中

globalData: {
	backgroundPlayer: null
},

async onLaunch() {
  this.globalData.backgroundPlayer = wx.getBackgroundAudioManager();
},

// 在player.js 中

const app = getApp();

async onLoad() {
	this.backgroundPlayer = app.globalData.backgroundPlayer;
}
```












































