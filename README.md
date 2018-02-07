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

在设置新音频的 `src` 的时候，必须设置相应的 `title	`，否则的话在iOS上面会报错不能播放的，设置了 `title` 后，iOS机上不会有拨错信息，但是安卓机上仍然有报错信息，但是不会影响播放


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

5.设置 播放/暂停 状态

```$xslt

// 使用的是背景音频的 play() / pause() 的方法

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
  
  // 监听播放/暂停状态 使用 onPlay() 和 onPause() 方法
  this.backgorundPlayer.onPlay(() => {
  	
  });
	this.backgorundPlayer.onPause(() => {
			
	});
```

6.实现上一首/下一首功能

只需要改变音频的src就可以自动播放了，找到当前列表中对应的播放id的上一首/下一首，将src设置为相应的src即可

```$xslt
prev() {
	if (this.data.i === 0) {
		console.log('这就是第一首');
		return;
	}
	if (songs[this.data.i - 1]) {
		this.backgroundPlayer.src = songs[this.data.i - 1].src;
		this.backgroundPlayer.title = songs[this.data.i - 1].name;
		this.setData({
			i: this.data.i - 1
		})
	}
}

next() {
	if (this.data.i === songs.length - 1) {
		console.log('这就是第一首');
		return;
	}
	if (songs[this.data.i + 1]) {
		this.backgroundPlayer.src = songs[this.data.i + 1].src;
		this.backgroundPlayer.title = songs[this.data.i + 1].name;
		this.setData({
			i: this.data.i + 1
		})
	}
}

```

7.在退出小程序后，音频在微信后台播放，点击后台查看的时候，显示背景图，这个背景图该怎么设置呢

```$xslt
this.backgroundPlayer.coverImgUrl = xxx
```

这里需要注意以下几点
- 在设置完src后就实时的将coverImgUrl也设置上，在onPlay里面也需要设置coverImgUrl，否则的话iOS不会显示出来

- 点击上一首/下一首切换音频的时候，如果在重新设置src的时候，没有设置coverImgUrl，在安卓机上，即时在onPlay函数里有设置新的coverImgUrl，但是切换音频后，新的音频背景图是没有的，所以必须在设置src的时候也设置上coverImgUrl


8.音频报错情况处理

微信小程序官方给出了以下几个错误码，使用 `this.backgroundPlayer.onError` 	去处理提示给用户

```$xslt

10001 系统错误
10002 网络错误
10003 文件错误
10004 格式错误
-1 未知错误

```

什么时候会报错呢

- 可能是当前网络问题

- 可能是音频url错误



9.音频加载过程，使用 `this.backgroundPlayer.onWaiting` 去处理

```$xslt
// 增加一个data waiting 用它来标识loading过程
this.backgroundPlayer.onWaiting(() => {
	that.setData({waiting: true})
});

// 在音频可以播放的时候，把waiting置未false

this.backgroundPlayer.onTimeUpdate(() => {
	that.setData({
		waiting: false
	})
});
```

10.音频自然播放结束后，自动切换到下一首，使用 `onEnded` 方法

```
this.backgroundPlayer.onEnded(() => {
	// 如果当前音频是最后一首，不处理，否则的话，重新复制url就可以了
})

```

11.在iOS上面锁屏状态下切换音频，使用 `onPrev 、 onNext` 这个两个方法

```
this.backgroundPlayer.onPrev(() => {
	that.prev()  //直接调用上一首 / 下一首的方法即可
});

this.backgroundPlayer.onNext(() => {
	that.next()  //直接调用上一首 / 下一首的方法即可
});
```


8.自定义组件

微信小程序提供了一些toast、loading等组件，但是这些组件的样式都是固定的，有时候并不能满足我们的需求，这个时候就需要我们自定义组件了

新建一个通用的文件夹	`common` 来表示自己定义的组件

```$xslt
// toast.wxml 中
<template name="toast">
  <block wx:if="{{toast.show}}">
    <view class="toast-wrap">
      <view class="toast-content">{{toast.content}}</view>
    </view>
  </block>
</template>

// toast.js 中
function toast(params) {
  const that = getCurrentPages()[getCurrentPages().length - 1];
  setTimeout(() => {
    that.setData({
      toast: {
        show: false,
      }
    });
  }, params.duration || 2000);
  that.setData({
    toast: {
      show: params.show,
      content: params.content
    }
  })
}

module.exports = {
  toast
};

// 如何引用呢

// 在需要使用的页面中

<import src="../../common/toast/toast.wxml"/>
<template is="toast" data="{{toast}}"/>

// 同时，将wxss引入到app.wxss中

在需要的时候调用即可

const toast = require('../../common/toast/toast');

toast.toast({
	show: true,
	content: '报错啦'
});

```


### 总结

在开发过程中需要注意的问题

1. 背景音频必须放在全局下

2. 设置音频src的时候必须设置相应的title

3. 如果背景音频的一系列的控制逻辑（onPlay / onPause / onWaiting / onError / onTimeUpdate）等处理函数放在onLoad函数中的话，以下一种情况下会有一个问题

	比如，当前页面是player播放器，该页面上有一个按钮链接到一个新的页面（播放列表页面），在这个播放列表页面里面，点击播放列表中的任何一个音频切换音频或者点击当前的音频，都要回到player播放器这个页面，这个时候只能使用 navigateTo 到player，这个player跟一开始的那个player不是同一个页面，如果点击返回按钮的话回到最初的player页面，那个页面会维持在音频切换前的状态，而不会根据切换后的音频的状态展示页面和音频进度之类的，这个时候的解决方案就是使用onShow去写；
而且这种情况还会造成另外一种情况就是点击player上面的播放列表，在播放列表再切换音频到player页面，再次进入到播放列表页面，以此循环，会使得navigate的页面太多，而微信小程序只允许5层，这个会导致用户这样连续点的话到后面就无法点击了，暂时没有什么好的解决方案，但是有一种方案可以尝试一下，就是将player和播放列表放在同一个页面，但是会有另外一个问题，在播放列表上点击返回按钮会直接回到player之前的页面，而不会回到player页面；如果产品上播放列表是一个不全屏的弹层的话就不会存在这些问题了

4.在安卓机上，会一直报 `setbackgroundaudiostate:fail` 的一个错误，暂时无解，查看[解决方案](https://developers.weixin.qq.com/blogdetail?action=get_post_info&lang=zh_CN&token=&docid=b1cfd912cdd224f63577f086507abab6) 但是貌似在安卓机上没啥卵用







































