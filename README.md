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

2.音频播放

设置音频的`src` 就可以了
```$xslt
this.backgroundPlayer.src = this.data.playerData.src;
this.backgroundPlayer.title = this.data.playerData.name;
```

这里有一个问题要注意一下：

在设置新音频的 `src` 的时候，必须设置相应的 `title	`，否则的话在iOS上面会报错的


3.音频播放时，动态设置当前播放的时长和相应的进度条

```
// 当前音频的播放总时长
this.duration = this.backgroundPlayer.duration;

// 当前音频的播放时长
this.currentTime = this.backgroundPlayer.currentTime;

// 在播放的过程中，通过 onTimeUpdate 方法实时获取，并且动态赋值相应的值

this.backgroundPlayer.onTimeUpdate(() => {
	this.duration = this.backgroundPlayer.duration;
	this.currentTime = this.backgroundPlayer.currentTime;
	
	this.setData({
		currentTime: xxx,
		duration: xxx,
		playerWidth: this.currentTime / this.duration * 100 的百分比
	});
});

```

4.音频拖拽播放 --- 使用音频的 `seek` 方法

```$xslt

// 拖拽
记录拖拽开始位置以及拖拽过程中移动的位置和拖拽结束的位置
e.changedTouches[0].pageX

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
    this.backgroundPlayer.seek(this.currentTime / 1000);  // 使用seek方法实现音频拖拽后继续播放功能
  },

```















































